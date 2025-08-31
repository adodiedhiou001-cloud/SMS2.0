import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth/service';

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const { params } = context;
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

    // Récupérer le groupe spécifique
    const group = await prisma.contactGroup.findFirst({
      where: {
        id: params.id,
        organizationId: authResult.user.organizationId,
      },
      include: {
        _count: {
          select: {
            contacts: true
          }
        }
      }
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Groupe introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: group.id,
        name: group.name,
        description: group.description,
        color: group.color,
        icon: group.icon,
        contactCount: group._count.contacts,
        createdAt: group.createdAt.toISOString(),
        updatedAt: group.updatedAt.toISOString()
      },
    });

  } catch (error: any) {
    console.error('Erreur lors de la récupération du groupe:', error);
    
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
    const { name, description, color, icon } = body;

    // Vérifier que le groupe existe et appartient à l'organisation
    const existingGroup = await prisma.contactGroup.findFirst({
      where: {
        id: params.id,
        organizationId: authResult.user.organizationId,
      },
    });

    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Groupe introuvable' },
        { status: 404 }
      );
    }

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Le nom du groupe est requis' },
        { status: 400 }
      );
    }

    // Vérifier si un autre groupe avec ce nom existe déjà
    const duplicateGroup = await prisma.contactGroup.findFirst({
      where: {
        name: name.trim(),
        organizationId: authResult.user.organizationId,
        id: { not: params.id },
      },
    });

    if (duplicateGroup) {
      return NextResponse.json(
        { error: 'Un autre groupe avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Mettre à jour le groupe
    const updatedGroup = await prisma.contactGroup.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(color && { color }),
        ...(icon && { icon }),
        updatedAt: new Date(),
      },
    });

    // Log de l'audit
    await prisma.auditLog.create({
      data: {
        action: 'group_updated',
        resource: 'contact_group',
        resourceId: params.id,
        userId: authResult.user.id,
        organizationId: authResult.user.organizationId,
        metadata: JSON.stringify({ 
          changes: { name, description, color, icon }
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedGroup,
    });

  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du groupe:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const { params } = context;
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

    // Vérifier que le groupe existe et appartient à l'organisation
    const existingGroup = await prisma.contactGroup.findFirst({
      where: {
        id: params.id,
        organizationId: authResult.user.organizationId,
      },
    });

    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Groupe introuvable' },
        { status: 404 }
      );
    }

    // Détacher les contacts de ce groupe (ne pas les supprimer)
    await prisma.contact.updateMany({
      where: { groupId: params.id },
      data: { groupId: null },
    });

    // Supprimer le groupe
    await prisma.contactGroup.delete({
      where: { id: params.id },
    });

    // Log de l'audit
    await prisma.auditLog.create({
      data: {
        action: 'group_deleted',
        resource: 'contact_group',
        resourceId: params.id,
        userId: authResult.user.id,
        organizationId: authResult.user.organizationId,
        metadata: JSON.stringify({ 
          groupName: existingGroup.name
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Groupe supprimé avec succès',
    });

  } catch (error: any) {
    console.error('Erreur lors de la suppression du groupe:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
