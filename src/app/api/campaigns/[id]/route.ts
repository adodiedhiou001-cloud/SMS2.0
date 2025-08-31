import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth/service';

export async function GET(
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

    // Récupérer la campagne spécifique
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        organizationId: authResult.user.organizationId, // Sécurité : seules les campagnes de l'organisation
      },
      include: {
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campagne introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: campaign,
    });

  } catch (error: any) {
    console.error('Erreur lors de la récupération de la campagne:', error);
    
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await request.json();
    const { name, message, scheduledAt, status } = body;

    // Vérifier que la campagne existe et appartient à l'organisation
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        organizationId: authResult.user.organizationId,
      },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campagne introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que la campagne peut être modifiée (pas envoyée)
    if (existingCampaign.status === 'sent') {
      return NextResponse.json(
        { error: 'Impossible de modifier une campagne déjà envoyée' },
        { status: 400 }
      );
    }

    // Mettre à jour la campagne
    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(message && { message }),
        ...(scheduledAt !== undefined && { 
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null 
        }),
        ...(status && { status }),
        updatedAt: new Date(),
      },
    });

    // Log de l'audit
    await prisma.auditLog.create({
      data: {
        action: 'campaign_updated',
        resource: 'campaign',
        resourceId: params.id,
        userId: authResult.user.id,
        organizationId: authResult.user.organizationId,
        metadata: JSON.stringify({ 
          changes: { name, message, scheduledAt, status }
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
    });

  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la campagne:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const body = await request.json();
    const { scheduledAt } = body;

    // Vérifier que la campagne existe et appartient à l'organisation
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        organizationId: authResult.user.organizationId,
      },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campagne introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que la campagne peut être modifiée
    if (!['draft', 'scheduled'].includes(existingCampaign.status)) {
      return NextResponse.json(
        { error: 'Impossible de modifier une campagne envoyée ou en cours d\'envoi' },
        { status: 400 }
      );
    }

    // Validation de la date si fournie
    if (scheduledAt) {
      const newDate = new Date(scheduledAt);
      const now = new Date();
      
      if (newDate <= now) {
        return NextResponse.json(
          { error: 'La date de planification doit être dans le futur' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour la campagne
    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        ...(scheduledAt !== undefined && { 
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          status: scheduledAt ? 'scheduled' : 'draft'
        }),
        updatedAt: new Date(),
      },
    });

    // Log de l'audit
    await prisma.auditLog.create({
      data: {
        action: 'campaign_schedule_updated',
        resource: 'campaign',
        resourceId: params.id,
        userId: authResult.user.id,
        organizationId: authResult.user.organizationId,
        metadata: JSON.stringify({ 
          oldScheduledAt: existingCampaign.scheduledAt,
          newScheduledAt: scheduledAt
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: 'Planning modifié avec succès',
    });

  } catch (error: any) {
    console.error('Erreur lors de la modification du planning:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la modification du planning' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campagne introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que la campagne peut être supprimée (pas en cours d'envoi)
    if (existingCampaign.status === 'sending') {
      return NextResponse.json(
        { error: 'Impossible de supprimer une campagne en cours d\'envoi' },
        { status: 400 }
      );
    }

    // Supprimer la campagne
    await prisma.campaign.delete({
      where: { id: params.id },
    });

    // Log de l'audit
    await prisma.auditLog.create({
      data: {
        action: 'campaign_deleted',
        resource: 'campaign',
        resourceId: params.id,
        userId: authResult.user.id,
        organizationId: authResult.user.organizationId,
        metadata: JSON.stringify({ 
          campaignName: existingCampaign.name 
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Campagne supprimée avec succès',
    });

  } catch (error: any) {
    console.error('Erreur lors de la suppression de la campagne:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
