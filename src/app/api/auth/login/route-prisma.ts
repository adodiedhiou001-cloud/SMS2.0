import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '../../../../lib/auth/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur et mot de passe requis' },
        { status: 400 }
      );
    }

    // Authentifier l'utilisateur avec Prisma
    const result = await authenticateUser(username, password);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        token: result.token,
        user: result.user,
        organization: result.organization,
      },
    });

  } catch (error: any) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Erreur de connexion' },
      { status: 500 }
    );
  }
}
