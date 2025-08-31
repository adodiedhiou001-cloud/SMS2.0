import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth/service-prisma';

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
    const result = await getUserFromToken(token);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: result.user,
        organization: result.organization,
      },
    });

  } catch (error: any) {
    console.error('Token verification error:', error);
    
    return NextResponse.json(
      { error: 'Erreur de vérification du token' },
      { status: 500 }
    );
  }
}
