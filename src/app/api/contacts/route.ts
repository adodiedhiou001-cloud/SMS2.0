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

    // Paramètres de recherche
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const groupId = searchParams.get('groupId')

    // Construire les conditions de filtrage
    const whereConditions: any = {
      organizationId: authResult.user.organizationId
    }

    if (search) {
      whereConditions.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (groupId) {
      if (groupId === 'no-group') {
        whereConditions.groupId = null
      } else {
        whereConditions.groupId = groupId
      }
    }

    // Récupérer les contacts avec leurs groupes
    const contacts = await prisma.contact.findMany({
      where: whereConditions,
      include: {
        group: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true
          }
        }
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    });

    // Transformer les données pour compatibilité
    const transformedContacts = contacts.map((contact: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
      email?: string | null;
      company?: string | null;
      address?: string | null;
      dateOfBirth?: Date | null;
      notes?: string | null;
      tags?: string | null;
      group: any;
      createdAt: Date;
      updatedAt: Date;
    }) => ({
      id: contact.id,
      name: `${contact.firstName} ${contact.lastName}`,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phoneNumber: contact.phone,
      phone: contact.phone,
      email: contact.email,
      company: contact.company,
      address: contact.address,
      dateOfBirth: contact.dateOfBirth,
      notes: contact.notes,
      tags: contact.tags ? JSON.parse(contact.tags) : [],
      group: contact.group,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt
    }))

    return NextResponse.json(transformedContacts);

  } catch (error: any) {
    console.error('Erreur lors de la récupération des contacts:', error);
    
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
    const { firstName, lastName, phone, email, dateOfBirth, groupId } = body;

    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'Le prénom, nom et numéro de téléphone sont requis' },
        { status: 400 }
      );
    }

    // Validation du format du numéro de téléphone
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Format de numéro de téléphone invalide (doit commencer par + suivi de chiffres)' },
        { status: 400 }
      );
    }

    // Validation de l'email si fourni
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Vérifier si le numéro existe déjà dans l'organisation
    const existingContact = await prisma.contact.findFirst({
      where: {
        phone: phone,
        organizationId: authResult.user.organizationId,
      },
    });

    if (existingContact) {
      return NextResponse.json(
        { error: 'Un contact avec ce numéro de téléphone existe déjà' },
        { status: 400 }
      );
    }

    // Vérifier que le groupe existe si spécifié
    if (groupId) {
      const group = await prisma.contactGroup.findFirst({
        where: {
          id: groupId,
          organizationId: authResult.user.organizationId,
        },
      });

      if (!group) {
        return NextResponse.json(
          { error: 'Groupe de contact non trouvé' },
          { status: 400 }
        );
      }
    }

    // Créer le contact
    const contact = await prisma.contact.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone,
        email: email?.trim() || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        groupId: groupId || null,
        organizationId: authResult.user.organizationId,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    // Log de l'audit
    await prisma.auditLog.create({
      data: {
        action: 'contact_created',
        resource: 'contact',
        resourceId: contact.id,
        userId: authResult.user.id,
        organizationId: authResult.user.organizationId,
        metadata: JSON.stringify({ 
          contactName: `${firstName} ${lastName}`,
          phoneNumber: phone,
          hasEmail: !!email,
          groupId: groupId || null,
          groupName: contact.group?.name || null,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: contact,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erreur lors de la création du contact:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la création du contact' },
      { status: 500 }
    );
  }
}
