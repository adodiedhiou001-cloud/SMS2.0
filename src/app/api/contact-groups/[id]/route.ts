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

// GET /api/contact-groups/[id] - Récupérer un groupe spécifique
export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const { params } = context;
    // Vérification de l'authentification
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const group = await prisma.contactGroup.findFirst({
      where: {
        id: params.id,
        organizationId: decoded.organizationId
      },
      include: {
        contacts: {
          orderBy: {
            firstName: 'asc'
          }
        },
        _count: {
          select: { contacts: true }
        }
      }
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Groupe non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(group)
  } catch (error) {
    console.error('Erreur lors de la récupération du groupe:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// PUT /api/contact-groups/[id] - Modifier un groupe
export async function PUT(
  request: NextRequest,
  context: any
) {
  const { params } = context;
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

    // Vérifier que le groupe existe et appartient à l'organisation
    const existingGroup = await prisma.contactGroup.findFirst({
      where: {
        id: params.id,
        organizationId: decoded.organizationId
      }
    })

    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Groupe non trouvé' },
        { status: 404 }
      )
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

    // Vérifier si un autre groupe avec ce nom existe déjà
    const duplicateGroup = await prisma.contactGroup.findFirst({
      where: {
        name: name.trim(),
        organizationId: decoded.organizationId,
        id: { not: params.id }
      }
    })

    if (duplicateGroup) {
      return NextResponse.json(
        { error: 'Un autre groupe avec ce nom existe déjà' },
        { status: 409 }
      )
    }

    // Mettre à jour le groupe
    const updatedGroup = await prisma.contactGroup.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || existingGroup.color,
        icon: icon || existingGroup.icon
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
        action: 'UPDATE',
        resource: 'ContactGroup',
        resourceId: updatedGroup.id,
        userId: decoded.userId,
        organizationId: decoded.organizationId,
        metadata: JSON.stringify({
          changes: {
            name: { from: existingGroup.name, to: updatedGroup.name },
            description: { from: existingGroup.description, to: updatedGroup.description }
          }
        })
      }
    })

    return NextResponse.json(updatedGroup)
  } catch (error) {
    console.error('Erreur lors de la modification du groupe:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/contact-groups/[id] - Supprimer un groupe
export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const { params } = context;
    // Vérification de l'authentification
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Vérifier que le groupe existe et appartient à l'organisation
    const existingGroup = await prisma.contactGroup.findFirst({
      where: {
        id: params.id,
        organizationId: decoded.organizationId
      },
      include: {
        _count: {
          select: { contacts: true }
        }
      }
    })

    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Groupe non trouvé' },
        { status: 404 }
      )
    }

    // Si le groupe contient des contacts, les déplacer vers "aucun groupe"
    if (existingGroup._count.contacts > 0) {
      await prisma.contact.updateMany({
        where: {
          groupId: params.id
        },
        data: {
          groupId: null
        }
      })
    }

    // Supprimer le groupe
    await prisma.contactGroup.delete({
      where: { id: params.id }
    })

    // Log d'audit
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        resource: 'ContactGroup',
        resourceId: params.id,
        userId: decoded.userId,
        organizationId: decoded.organizationId,
        metadata: JSON.stringify({
          groupName: existingGroup.name,
          contactsMovedToNoGroup: existingGroup._count.contacts
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression du groupe:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
