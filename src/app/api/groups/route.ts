import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth/service';

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

    // Récupérer tous les groupes de l'organisation avec le nombre de contacts
    const groups = await prisma.contactGroup.findMany({
      where: {
        organizationId: authResult.user.organizationId,
      },
      include: {
        _count: {
          select: {
            contacts: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transformer les données pour correspondre à l'interface
    const formattedGroups = groups.map((group: {
      id: string;
      name: string;
      description?: string | null;
      color?: string | null;
      icon?: string | null;
      _count: { contacts: number };
      createdAt: Date;
      updatedAt: Date;
    }) => ({
      id: group.id,
      name: group.name,
      description: group.description || '',
      color: group.color,
      icon: group.icon,
      contactCount: group._count.contacts,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      groups: formattedGroups,
    });

  } catch (error: any) {
    console.error('Erreur lors de la récupération des groupes:', error);
    
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Le nom du groupe est requis' },
        { status: 400 }
      );
    }

    // Vérifier si un groupe avec ce nom existe déjà
    const existingGroup = await prisma.contactGroup.findFirst({
      where: {
        name: name.trim(),
        organizationId: authResult.user.organizationId,
      },
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: 'Un groupe avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Créer le nouveau groupe
    const newGroup = await prisma.contactGroup.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        icon: icon || 'Users',
        organizationId: authResult.user.organizationId,
      },
    });

    // Log de l'audit
    await prisma.auditLog.create({
      data: {
        action: 'group_created',
        resource: 'contact_group',
        resourceId: newGroup.id,
        userId: authResult.user.id,
        organizationId: authResult.user.organizationId,
        metadata: JSON.stringify({ groupName: newGroup.name }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newGroup.id,
        name: newGroup.name,
        description: newGroup.description,
        color: newGroup.color,
        icon: newGroup.icon,
        contactCount: 0,
        createdAt: newGroup.createdAt.toISOString(),
        updatedAt: newGroup.updatedAt.toISOString()
      },
    });

  } catch (error: any) {
    console.error('Erreur lors de la création du groupe:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la création du groupe' },
      { status: 500 }
    );
  }
}
