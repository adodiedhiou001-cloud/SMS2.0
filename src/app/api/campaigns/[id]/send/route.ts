import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth/service';
import { campaignScheduler } from '@/lib/campaign-scheduler';

export async function POST(
  request: NextRequest,
  context: any
) {
  const { params } = context;
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

    // Vérifier que la campagne existe et appartient à l'organisation
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        organizationId: authResult.user.organizationId,
      },
      include: {
        messages: {
          include: {
            contact: true
          }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campagne introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que la campagne peut être envoyée
    if (campaign.status === 'sent' || campaign.status === 'sending') {
      return NextResponse.json(
        { error: 'La campagne a déjà été envoyée' },
        { status: 400 }
      );
    }

    if (campaign.status === 'failed') {
      return NextResponse.json(
        { error: 'Impossible d\'envoyer une campagne en échec' },
        { status: 400 }
      );
    }

    if (campaign.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Impossible d\'envoyer une campagne annulée' },
        { status: 400 }
      );
    }

    console.log(`📱 Demande d'envoi immédiat pour la campagne: "${campaign.name}"`);

    // Marquer la campagne comme programmée temporairement pour utiliser le scheduler
    await prisma.campaign.update({
      where: { id: params.id },
      data: { 
        status: 'scheduled',
        scheduledAt: new Date() // Maintenant
      }
    });

    // Utiliser le scheduler pour envoyer
    const result = await campaignScheduler.sendCampaignNow(params.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erreur lors de l\'envoi' },
        { status: 500 }
      );
    }

    // Récupérer la campagne mise à jour
    const updatedCampaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        messages: {
          include: {
            contact: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    });

    console.log(`✅ Campagne "${campaign.name}" envoyée avec succès`);

    return NextResponse.json({
      success: true,
      data: {
        campaign: updatedCampaign,
        message: 'Campagne envoyée avec succès'
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur lors de l\'envoi de la campagne:', error);
    
    // Remettre la campagne en draft en cas d'erreur
    try {
      await prisma.campaign.update({
        where: { id: params.id },
        data: { status: 'draft' }
      });
    } catch (rollbackError) {
      console.error('Erreur lors du rollback:', rollbackError);
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la campagne' },
      { status: 500 }
    );
  }
}
