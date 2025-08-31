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

// GET /api/contact-groups - Récupérer tous les groupes de contacts
export async function GET(request: NextRequest) {
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

    // Récupérer les groupes avec le nombre de contacts
    const groups = await prisma.contactGroup.findMany({
      where: {
        organizationId: decoded.organizationId
      },
      include: {
        _count: {
          select: { contacts: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error('Erreur lors de la récupération des groupes:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST /api/contact-groups - Créer un nouveau groupe
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

    const body = await request.json()
    const { name, description, color, icon } = body

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le nom du groupe est requis' },
        { status: 400 }
      )
    }

    // Vérifier si un groupe avec ce nom existe déjà
    const existingGroup = await prisma.contactGroup.findFirst({
      where: {
        name: name.trim(),
        organizationId: decoded.organizationId
      }
    })

    if (existingGroup) {
      return NextResponse.json(
        { error: 'Un groupe avec ce nom existe déjà' },
        { status: 409 }
      )
    }

    // Créer le groupe
    const group = await prisma.contactGroup.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        icon: icon || 'Users',
        organizationId: decoded.organizationId
      },
      include: {
        _count: {
          select: { contacts: true }
        }
      }
    })

    // Log d'audit
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        resource: 'ContactGroup',
        resourceId: group.id,
        userId: decoded.userId,
        organizationId: decoded.organizationId,
        metadata: JSON.stringify({
          groupName: group.name,
          groupColor: group.color
        })
      }
    })

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du groupe:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
