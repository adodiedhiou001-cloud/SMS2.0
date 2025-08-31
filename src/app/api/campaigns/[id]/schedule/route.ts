import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const { params } = context;
    // Vérification de l'authentification
    const decoded = await verifyJWT(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    const { scheduledAt } = await request.json();

    if (!scheduledAt) {
      return NextResponse.json(
        { error: 'Date de planification requise' },
        { status: 400 }
      );
    }

    // Vérifier que la date est dans le futur
    const newDate = new Date(scheduledAt);
    if (newDate <= new Date()) {
      return NextResponse.json(
        { error: 'La date de planification doit être dans le futur' },
        { status: 400 }
      );
    }

    // Récupérer la campagne et vérifier les permissions
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        organization: {
          include: {
            users: true
          }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campagne non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur appartient à l'organisation
    const userBelongsToOrg = campaign.organization.users.some(
      (user: { id: string }) => user.id === decoded.userId
    );

    if (!userBelongsToOrg) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette campagne' },
        { status: 403 }
      );
    }

    // Vérifier que la campagne peut être modifiée
    if (campaign.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Seules les campagnes programmées peuvent avoir leur planning modifié' },
        { status: 400 }
      );
    }

    // Mettre à jour le planning
    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        scheduledAt: newDate,
        updatedAt: new Date()
      }
    });

    console.log(`📅 Planning modifié pour la campagne ${campaign.name} (${params.id})`);
    console.log(`   Nouveau planning: ${newDate.toLocaleString('fr-FR')}`);

    return NextResponse.json({
      success: true,
      message: 'Planning modifié avec succès',
      data: updatedCampaign
    });

  } catch (error) {
    console.error('Erreur lors de la modification du planning:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
