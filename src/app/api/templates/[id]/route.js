import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth/service';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const authResult = await auth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const template = await prisma.template.findFirst({
      where: {
        id: params.id,
        organizationId: authResult.user.organizationId
      },
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      template: {
        ...template,
        variables: template.variables ? JSON.parse(template.variables) : [],
        tags: template.tags ? JSON.parse(template.tags) : []
      }
    });

  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const authResult = await auth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      content,
      category,
      tags = [],
      variables = [],
      promoCode,
      promoValue,
      promoExpiry,
      isActive
    } = body;

    // Vérifier que le template existe et appartient à l'organisation
    const existingTemplate = await prisma.template.findFirst({
      where: {
        id: params.id,
        organizationId: authResult.user.organizationId
      }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Vérifier si c'est un template système (non modifiable)
    if (existingTemplate.isSystem) {
      return NextResponse.json(
        { error: 'System templates cannot be modified' },
        { status: 403 }
      );
    }

    const updatedTemplate = await prisma.template.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(content !== undefined && { content }),
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags: tags.length > 0 ? JSON.stringify(tags) : null }),
        ...(variables !== undefined && { variables: variables.length > 0 ? JSON.stringify(variables) : null }),
        ...(promoCode !== undefined && { promoCode }),
        ...(promoValue !== undefined && { promoValue }),
        ...(promoExpiry !== undefined && { promoExpiry: promoExpiry ? new Date(promoExpiry) : null }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json({
      template: {
        ...updatedTemplate,
        variables: updatedTemplate.variables ? JSON.parse(updatedTemplate.variables) : [],
        tags: updatedTemplate.tags ? JSON.parse(updatedTemplate.tags) : []
      }
    });

  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const authResult = await auth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // Vérifier que le template existe et appartient à l'organisation
    const existingTemplate = await prisma.template.findFirst({
      where: {
        id: params.id,
        organizationId: authResult.user.organizationId
      }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Vérifier si c'est un template système (non supprimable)
    if (existingTemplate.isSystem) {
      return NextResponse.json(
        { error: 'System templates cannot be deleted' },
        { status: 403 }
      );
    }

    await prisma.template.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
