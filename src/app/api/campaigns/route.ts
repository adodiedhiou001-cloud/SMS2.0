import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { getUserFromToken } from '@/lib/auth/service';
import { smsService } from '@/lib/sms/sms-service';

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

    // Récupérer les campagnes de l'organisation de l'utilisateur
    const campaigns = await prisma.campaign.findMany({
      where: {
        organizationId: authResult.user.organizationId,
      },
      include: {
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: campaigns,
    });

  } catch (error: any) {
    console.error('Erreur lors de la récupération des campagnes:', error);
    
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

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
    const { name, message, scheduledAt, targetType, targetGroups } = body;

    if (!name || !message) {
      return NextResponse.json(
        { error: 'Le nom et le message sont requis' },
        { status: 400 }
      );
    }

    if (message.length === 0) {
      return NextResponse.json(
        { error: 'Le message ne peut pas être vide' },
        { status: 400 }
      );
    }

    // Validation du ciblage
    if (targetType === 'groups' && (!targetGroups || targetGroups.length === 0)) {
      return NextResponse.json(
        { error: 'Au moins un groupe doit être sélectionné' },
        { status: 400 }
      );
    }

    // Récupérer les contacts ciblés
    let targetedContacts;
    
    if (targetType === 'all') {
      // Tous les contacts de l'organisation
      targetedContacts = await prisma.contact.findMany({
        where: {
          organizationId: authResult.user.organizationId,
        },
      });
    } else {
      // Contacts des groupes sélectionnés
      targetedContacts = await prisma.contact.findMany({
        where: {
          organizationId: authResult.user.organizationId,
          groupId: {
            in: targetGroups,
          },
        },
      });
    }

    if (targetedContacts.length === 0) {
      return NextResponse.json(
        { error: 'Aucun contact trouvé pour le ciblage sélectionné' },
        { status: 400 }
      );
    }

    // Utiliser une transaction pour créer la campagne et les messages
  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Créer la campagne
      const campaign = await tx.campaign.create({
        data: {
          name,
          message,
          status: scheduledAt ? 'scheduled' : 'draft',
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          organizationId: authResult.user.organizationId,
          createdBy: authResult.user.id,
        },
      });

      // Créer les messages pour chaque contact ciblé
      const messages = await Promise.all(
        targetedContacts.map((contact: { id: string; phone: string }) =>
          tx.message.create({
            data: {
              content: message,
              status: scheduledAt ? 'scheduled' : 'draft',
              contactId: contact.id,
              campaignId: campaign.id,
              phoneNumber: contact.phone,
            },
          })
        )
      );

      // Log de l'audit
      await tx.auditLog.create({
        data: {
          action: 'campaign_created',
          resource: 'campaign',
          resourceId: campaign.id,
          userId: authResult.user.id,
          organizationId: authResult.user.organizationId,
          metadata: JSON.stringify({ 
            campaignName: name, 
            scheduled: !!scheduledAt,
            targetType,
            targetGroups: targetType === 'groups' ? targetGroups : null,
            contactCount: targetedContacts.length,
            messageCount: messages.length
          }),
        },
      });

      return { campaign, messages };
    });

    // Logique d'envoi selon la programmation
    const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;
    const now = new Date();
    
    if (!scheduledDate || scheduledDate <= now) {
      // Envoi immédiat si pas de programmation ou date déjà passée
      console.log(`📱 Envoi immédiat de la campagne "${name}" vers ${targetedContacts.length} contacts`);
      
      try {
        // Préparer les numéros de téléphone
  const phoneNumbers = targetedContacts.map((contact: { phone: string }) => contact.phone);
        
        // Envoyer les SMS
        const smsResult = await smsService.sendBulkSMS(phoneNumbers, message);
        
        // Mettre à jour le statut de la campagne
        await prisma.campaign.update({
          where: { id: result.campaign.id },
          data: {
            status: smsResult.failed === 0 ? 'sent' : 'partially_sent',
            sentAt: new Date()
          }
        });

        // Mettre à jour le statut des messages
        await Promise.all(
          smsResult.results.map(async (smsRes, index) => {
            const contact = targetedContacts[index];
            return prisma.message.updateMany({
              where: {
                campaignId: result.campaign.id,
                contactId: contact.id
              },
              data: {
                status: smsRes.result.success ? 'sent' : 'failed',
                sentAt: smsRes.result.success ? new Date() : null,
                provider: 'Orange Sénégal',
                externalId: smsRes.result.messageId,
                metadata: JSON.stringify({
                  error: smsRes.result.error,
                  provider: 'Orange Sénégal'
                })
              }
            });
          })
        );

        console.log(`✅ Campagne envoyée: ${smsResult.success} succès, ${smsResult.failed} échecs`);
        
        return NextResponse.json({
          success: true,
          data: {
            campaign: result.campaign,
            messagesCreated: result.messages.length,
            targetedContacts: targetedContacts.length,
            smsResult: {
              sent: smsResult.success,
              failed: smsResult.failed,
              status: 'sent_immediately'
            }
          },
        }, { status: 201 });

      } catch (smsError: any) {
        console.error('❌ Erreur lors de l\'envoi SMS:', smsError);
        
        // Marquer la campagne comme échouée
        await prisma.campaign.update({
          where: { id: result.campaign.id },
          data: { status: 'failed' }
        });

        return NextResponse.json({
          success: false,
          error: 'Campagne créée mais échec de l\'envoi SMS',
          data: {
            campaign: result.campaign,
            messagesCreated: result.messages.length,
            smsError: smsError.message
          }
        }, { status: 207 }); // 207 Multi-Status
      }
    } else {
      // Programmé pour plus tard
      console.log(`⏰ Campagne "${name}" programmée pour ${scheduledDate.toLocaleString()}`);
      
      return NextResponse.json({
        success: true,
        data: {
          campaign: result.campaign,
          messagesCreated: result.messages.length,
          targetedContacts: targetedContacts.length,
          scheduledFor: scheduledDate.toISOString(),
          status: 'scheduled'
        },
      }, { status: 201 });
    }

  } catch (error: any) {
    console.error('Erreur lors de la création de la campagne:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la campagne' },
      { status: 500 }
    );
  }
}
