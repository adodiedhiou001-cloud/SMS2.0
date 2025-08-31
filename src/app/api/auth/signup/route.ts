import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, email } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur et mot de passe requis' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Validation de l'email si fourni
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      );
    }

    // Créer l'utilisateur avec Prisma
    const result = await createUser(username, password, email);

    // Réponse avec les données utilisateur et token
    return NextResponse.json({
      success: true,
      data: {
        token: result.token,
        user: result.user,
        organization: result.organization,
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('Signup error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du compte' },
      { status: 400 }
    );
  }
}
