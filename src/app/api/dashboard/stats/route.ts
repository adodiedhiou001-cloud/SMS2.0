import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth/service';

// Force dynamic rendering pour cette route
export const dynamic = 'force-dynamic';

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

    const { user } = authResult;

    // Récupérer les statistiques
    const [
      totalContacts,
      totalCampaigns,
      totalMessages,
      recentContacts,
      recentCampaigns
    ] = await Promise.all([
      // Total des contacts
      prisma.contact.count({
        where: { organizationId: user.organizationId }
      }),
      
      // Total des campagnes
      prisma.campaign.count({
        where: { organizationId: user.organizationId }
      }),
      
      // Total des messages
      prisma.message.count({
        where: {
          contact: {
            organizationId: user.organizationId
          }
        }
      }),
      
      // Contacts récents (5 derniers)
      prisma.contact.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          group: {
            select: { name: true, color: true }
          }
        }
      }),
      
      // Campagnes récentes (5 dernières)
      prisma.campaign.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          _count: {
            select: { messages: true }
          }
        }
      })
    ]);

    // Statistiques des messages par statut
    const messageStats = await prisma.message.groupBy({
      by: ['status'],
      where: {
        contact: {
          organizationId: user.organizationId
        }
      },
      _count: {
        status: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalContacts,
          totalCampaigns,
          totalMessages,
          messageStats: messageStats.reduce((acc: Record<string, number>, stat: { status: string; _count: { status: number } }) => {
            acc[stat.status] = stat._count.status;
            return acc;
          }, {} as Record<string, number>)
        },
        recentContacts,
        recentCampaigns
      }
    });

  } catch (error: any) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
