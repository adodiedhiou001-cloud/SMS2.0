import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth/service';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const authResult = await auth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const channel = searchParams.get('channel') || 'sms';
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = {
      organizationId: authResult.user.organizationId,
      channel: channel,
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        orderBy: [
          { isSystem: 'desc' },
          { category: 'asc' },
          { name: 'asc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              username: true,
              email: true
            }
          }
        }
      }),
      prisma.template.count({ where })
    ]);

    // Obtenir les catégories disponibles
    const categories = await prisma.template.groupBy({
      by: ['category'],
      where: {
        organizationId: authResult.user.organizationId,
        channel: channel
      },
      _count: {
        category: true
      }
    });

    return NextResponse.json({
      templates: templates.map(template => ({
        ...template,
        variables: template.variables ? JSON.parse(template.variables) : [],
        tags: template.tags ? JSON.parse(template.tags) : []
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      categories: categories.map(cat => ({
        name: cat.category,
        count: cat._count.category
      }))
    });

  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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
      channel = 'sms',
      tags = [],
      variables = [],
      promoCode,
      promoValue,
      promoExpiry
    } = body;

    if (!name || !content) {
      return NextResponse.json(
        { error: 'Name and content are required' },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        name,
        content,
        category: category || 'general',
        channel,
        tags: tags.length > 0 ? JSON.stringify(tags) : null,
        variables: variables.length > 0 ? JSON.stringify(variables) : null,
        promoCode,
        promoValue,
        promoExpiry: promoExpiry ? new Date(promoExpiry) : null,
        organizationId: authResult.user.organizationId,
        createdBy: authResult.user.id,
        isSystem: false
      }
    });

    return NextResponse.json({
      template: {
        ...template,
        variables: template.variables ? JSON.parse(template.variables) : [],
        tags: template.tags ? JSON.parse(template.tags) : []
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
