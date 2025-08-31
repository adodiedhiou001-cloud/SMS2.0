import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth/service';
import { smsService } from '@/lib/sms/sms-service';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const authResult = await getUserFromToken(token);
    
    if (!authResult) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { campaignId, phoneNumbers, message, type = 'campaign' } = body;

    // Validation des données
    if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return NextResponse.json(
        { error: 'Liste de numéros de téléphone requise' },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      );
    }

    console.log(`📱 Demande d'envoi SMS reçue:`, {
      campaignId,
      recipientCount: phoneNumbers.length,
      messageLength: message.length,
      type
    });

    // Vérifier que la campagne existe et appartient à l'organisation
    let campaign = null;
    if (campaignId) {
      campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          organizationId: authResult.user.organizationId
        }
      });

      if (!campaign) {
        return NextResponse.json(
          { error: 'Campagne non trouvée' },
          { status: 404 }
        );
      }
    }

    // Valider tous les numéros de téléphone
    const validPhoneNumbers: string[] = [];
    const invalidNumbers: string[] = [];

    phoneNumbers.forEach((phone: string) => {
      const validation = smsService.validatePhoneNumber(phone);
      if (validation.valid && validation.formatted) {
        validPhoneNumbers.push(validation.formatted);
      } else {
        invalidNumbers.push(phone);
      }
    });

    if (validPhoneNumbers.length === 0) {
      return NextResponse.json(
        { error: 'Aucun numéro de téléphone valide trouvé' },
        { status: 400 }
      );
    }

    // Estimation du coût
    const costEstimate = smsService.estimateCost(validPhoneNumbers, message);
    console.log(`💰 Estimation:`, costEstimate);

    // Envoyer les SMS
    console.log(`🚀 Envoi de ${validPhoneNumbers.length} SMS...`);
    const sendResult = await smsService.sendBulkSMS(validPhoneNumbers, message);

    // Créer les enregistrements de messages dans la base de données
    const messagePromises = sendResult.results.map(async (result) => {
      // Trouver le contact correspondant
      const contact = await prisma.contact.findFirst({
        where: {
          phone: result.phoneNumber,
          organizationId: authResult.user.organizationId
        }
      });

      return prisma.message.create({
        data: {
          content: message,
          status: result.result.success ? 'sent' : 'failed',
          sentAt: result.result.success ? new Date() : null,
          contactId: contact?.id,
          campaignId: campaignId || null,
          phoneNumber: result.phoneNumber,
          provider: 'Orange Sénégal',
          externalId: result.result.messageId,
          metadata: JSON.stringify({
            error: result.result.error,
            estimatedCost: costEstimate.estimatedCost / validPhoneNumbers.length,
            smsCount: costEstimate.smsCount
          })
        }
      });
    });

    await Promise.all(messagePromises);

    // Mettre à jour le statut de la campagne si applicable
    if (campaign) {
      const allSent = sendResult.failed === 0;
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: allSent ? 'sent' : 'partially_sent',
          sentAt: new Date()
        }
      });
    }

    // Log d'audit
    await prisma.auditLog.create({
      data: {
        action: 'sms_sent',
        resource: 'message',
        resourceId: campaignId || 'direct_sms',
        userId: authResult.user.id,
        organizationId: authResult.user.organizationId,
        metadata: JSON.stringify({
          recipientCount: validPhoneNumbers.length,
          successCount: sendResult.success,
          failedCount: sendResult.failed,
          invalidNumbers: invalidNumbers.length,
          estimatedCost: costEstimate.estimatedCost,
          messageLength: message.length,
          smsCount: costEstimate.smsCount,
          type
        })
      }
    });

    console.log(`✅ Envoi terminé: ${sendResult.success} succès, ${sendResult.failed} échecs`);

    return NextResponse.json({
      success: true,
      data: {
        sent: sendResult.success,
        failed: sendResult.failed,
        invalidNumbers,
        estimate: costEstimate,
        details: sendResult.results
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur lors de l\'envoi SMS:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi des SMS' },
      { status: 500 }
    );
  }
}

// API pour tester la configuration SMS
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const authResult = await getUserFromToken(token);
    
    if (!authResult) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    // Tester la configuration
    const testResult = await smsService.testConfiguration();
    const providerInfo = smsService.getProviderInfo();

    return NextResponse.json({
      success: true,
      data: {
        provider: providerInfo,
        configuration: testResult,
        features: {
          bulkSMS: true,
          costEstimation: true,
          phoneValidation: true,
          unicodeSupport: true
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur lors du test de configuration SMS:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors du test de configuration' },
      { status: 500 }
    );
  }
}
