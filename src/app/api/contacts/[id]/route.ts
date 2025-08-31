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

    // Récupérer le contact spécifique avec son groupe
    const contact = await prisma.contact.findFirst({
      where: {
        id: params.id,
        organizationId: authResult.user.organizationId, // Sécurité : seuls les contacts de l'organisation
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true
          }
        }
      }
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contact,
    });

  } catch (error: any) {
    console.error('Erreur lors de la récupération du contact:', error);
    
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
    const { firstName, lastName, phone, email, company, address, dateOfBirth, notes, tags, groupId } = body;

    // Vérifier que le contact existe et appartient à l'organisation
    const existingContact = await prisma.contact.findFirst({
      where: {
        id: params.id,
        organizationId: authResult.user.organizationId,
      },
    });

    if (!existingContact) {
      return NextResponse.json(
        { error: 'Contact introuvable' },
        { status: 404 }
      );
    }

    // Validation du format du numéro de téléphone si fourni
    if (phone) {
      const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/;
      const cleanPhone = phone.replace(/\s/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        return NextResponse.json(
          { error: 'Format de numéro de téléphone invalide (ex: 06 12 34 56 78)' },
          { status: 400 }
        );
      }

      // Vérifier si le nouveau numéro existe déjà (sauf pour le contact actuel)
      const duplicateContact = await prisma.contact.findFirst({
        where: {
          phone: cleanPhone,
          organizationId: authResult.user.organizationId,
          id: { not: params.id },
        },
      });

      if (duplicateContact) {
        return NextResponse.json(
          { error: 'Un autre contact avec ce numéro de téléphone existe déjà' },
          { status: 400 }
        );
      }
    }

    // Validation de l'email si fourni
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Mettre à jour le contact
    const updatedContact = await prisma.contact.update({
      where: { id: params.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone: phone.replace(/\s/g, '') }),
        ...(email !== undefined && { email: email || null }),
        ...(company !== undefined && { company: company || null }),
        ...(address !== undefined && { address: address || null }),
        ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(tags !== undefined && { tags: tags ? JSON.stringify(tags) : null }),
        ...(groupId !== undefined && { groupId: groupId || null }),
        updatedAt: new Date(),
      },
    });

    // Log de l'audit
    await prisma.auditLog.create({
      data: {
        action: 'contact_updated',
        resource: 'contact',
        resourceId: params.id,
        userId: authResult.user.id,
        organizationId: authResult.user.organizationId,
        metadata: JSON.stringify({ 
          changes: { firstName, lastName, phone, email, company, address, dateOfBirth, notes, tags, groupId }
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedContact,
    });

  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du contact:', error);
    
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

    // Vérifier que le contact existe et appartient à l'organisation
    const existingContact = await prisma.contact.findFirst({
      where: {
        id: params.id,
        organizationId: authResult.user.organizationId,
      },
    });

    if (!existingContact) {
      return NextResponse.json(
        { error: 'Contact introuvable' },
        { status: 404 }
      );
    }

    // Supprimer le contact
    await prisma.contact.delete({
      where: { id: params.id },
    });

    // Log de l'audit
    await prisma.auditLog.create({
      data: {
        action: 'contact_deleted',
        resource: 'contact',
        resourceId: params.id,
        userId: authResult.user.id,
        organizationId: authResult.user.organizationId,
        metadata: JSON.stringify({ 
          contactName: `${existingContact.firstName} ${existingContact.lastName}`,
          phone: existingContact.phone
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Contact supprimé avec succès',
    });

  } catch (error: any) {
    console.error('Erreur lors de la suppression du contact:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
