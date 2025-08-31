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

    // Récupérer tous les groupes de contacts de l'organisation avec le nombre de contacts
    const contactGroups = await prisma.contactGroup.findMany({
      where: {
        organizationId: authResult.user.organizationId
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

    return NextResponse.json(contactGroups);

  } catch (error: any) {
    console.error('Erreur lors de la récupération des groupes de contacts:', error);
    
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des groupes' },
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

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Le nom du groupe est requis' },
        { status: 400 }
      );
    }

    // Vérifier si un groupe avec ce nom existe déjà dans l'organisation
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

    // Créer le groupe de contacts
    const contactGroup = await prisma.contactGroup.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        icon: icon || 'Users',
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

    // Log de l'audit
    await prisma.auditLog.create({
      data: {
        action: 'contact_group_created',
        resource: 'contact_group',
        resourceId: contactGroup.id,
        userId: authResult.user.id,
        organizationId: authResult.user.organizationId,
        metadata: JSON.stringify({ 
          groupName: name.trim(),
          hasDescription: !!description,
          color: color || '#3B82F6',
          icon: icon || 'Users',
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: contactGroup,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erreur lors de la création du groupe de contacts:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la création du groupe' },
      { status: 500 }
    );
  }
}
