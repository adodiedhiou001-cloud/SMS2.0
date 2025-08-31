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

    const campaignId = params.id;

    // Vérifier que la campagne appartient à l'organisation de l'utilisateur
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        organizationId: authResult.user.organizationId,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campagne non trouvée' },
        { status: 404 }
      );
    }

    // Récupérer les messages de la campagne
    const messages = await prisma.message.findMany({
      where: {
        campaignId: campaignId,
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            group: {
              select: {
                id: true,
                name: true,
                color: true,
                icon: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(messages);

  } catch (error: any) {
    console.error('Erreur lors de la récupération des messages:', error);
    
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
