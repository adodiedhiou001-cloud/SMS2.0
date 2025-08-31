import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

const verifyJWT = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as any
  } catch {
    return null
  }
}

// POST /api/contact-groups/initialize - Initialiser les groupes par défaut
export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Récupérer l'utilisateur pour obtenir son organizationId
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { organizationId: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    // Vérifier si des groupes existent déjà
    const existingGroups = await prisma.contactGroup.findMany({
      where: {
        organizationId: user.organizationId
      }
    })

    if (existingGroups.length > 0) {
      return NextResponse.json(
        { message: 'Des groupes existent déjà', groups: existingGroups },
        { status: 200 }
      )
    }

    // Créer les groupes par défaut
    const defaultGroups = [
      {
        name: 'Clients fidèles',
        description: 'Clients réguliers avec un historique d\'achat important',
        color: '#10B981', // vert
        icon: 'Heart'
      },
      {
        name: 'Clients probables',
        description: 'Prospects intéressés par nos services',
        color: '#F59E0B', // orange
        icon: 'TrendingUp'
      },
      {
        name: 'Rendez-vous programmés',
        description: 'Contacts avec des rendez-vous à venir',
        color: '#3B82F6', // bleu
        icon: 'Calendar'
      },
      {
        name: 'Prospects chauds',
        description: 'Prospects très intéressés, prêts à convertir',
        color: '#EF4444', // rouge
        icon: 'Flame'
      },
      {
        name: 'Clients inactifs',
        description: 'Clients qui n\'ont pas acheté récemment',
        color: '#6B7280', // gris
        icon: 'Clock'
      },
      {
        name: 'VIP',
        description: 'Clients privilégiés et importants',
        color: '#8B5CF6', // violet
        icon: 'Crown'
      },
      {
        name: 'Partenaires',
        description: 'Partenaires commerciaux et collaborateurs',
        color: '#06B6D4', // cyan
        icon: 'Handshake'
      },
      {
        name: 'Support technique',
        description: 'Contacts pour le support et assistance',
        color: '#84CC16', // lime
        icon: 'Tool'
      }
    ]

    const createdGroups = []

    for (const groupData of defaultGroups) {
      const group = await prisma.contactGroup.create({
        data: {
          ...groupData,
          organizationId: user.organizationId
        },
        include: {
          _count: {
            select: { contacts: true }
          }
        }
      })
      createdGroups.push(group)
    }

    // Log d'audit
    await prisma.auditLog.create({
      data: {
        action: 'INITIALIZE',
        resource: 'ContactGroups',
        userId: decoded.userId,
        organizationId: decoded.organizationId,
        metadata: JSON.stringify({
          groupsCreated: createdGroups.length,
          groupNames: createdGroups.map(g => g.name)
        })
      }
    })

    return NextResponse.json({
      message: `${createdGroups.length} groupes créés avec succès`,
      groups: createdGroups
    }, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des groupes:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
