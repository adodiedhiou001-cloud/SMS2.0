import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth/service';

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
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        organizationId: authResult.user.organizationId,
      },
      include: {
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campagne introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que la campagne peut être annulée
    if (existingCampaign.status === 'sent') {
      return NextResponse.json(
        { error: 'Impossible d\'annuler une campagne déjà envoyée' },
        { status: 400 }
      );
    }

    if (existingCampaign.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cette campagne est déjà annulée' },
        { status: 400 }
      );
    }

    // Si la campagne est en cours d'envoi, annuler les messages en attente
    if (existingCampaign.status === 'sending') {
      await prisma.message.updateMany({
        where: {
          campaignId: params.id,
          status: 'pending',
        },
        data: {
          status: 'cancelled',
          updatedAt: new Date(),
        },
      });
    }

    // Annuler la campagne
    const cancelledCampaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        status: 'cancelled',
        updatedAt: new Date(),
      },
    });

    // Log de l'audit
    await prisma.auditLog.create({
      data: {
        action: 'campaign_cancelled',
        resource: 'campaign',
        resourceId: params.id,
        userId: authResult.user.id,
        organizationId: authResult.user.organizationId,
        metadata: JSON.stringify({ 
          campaignName: existingCampaign.name,
          previousStatus: existingCampaign.status,
          messageCount: existingCampaign._count.messages
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: cancelledCampaign,
      message: 'Campagne annulée avec succès',
    });

  } catch (error: any) {
    console.error('Erreur lors de l\'annulation de la campagne:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation' },
      { status: 500 }
    );
  }
}
