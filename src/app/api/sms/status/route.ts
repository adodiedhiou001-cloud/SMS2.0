// API pour vérifier le statut du compte Orange SMS (Admin uniquement)
import { NextRequest, NextResponse } from 'next/server';
import { OrangeSMSService } from '@/lib/sms/orange-service';
import { auth } from '@/lib/auth/service';

// Force dynamic rendering pour cette route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = await auth(request);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Vérifier si l'utilisateur est admin (Damzo)
    if (authResult.user?.username !== 'Damzo') {
      return NextResponse.json(
        { error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      );
    }
    
    console.log('🔍 Vérification du statut du compte Orange SMS...');
    
    const orangeService = new OrangeSMSService();
    
    // Test d'authentification pour vérifier la validité du compte
    const authTest = await orangeService.getAccountStatus();
    
    return NextResponse.json({
      success: true,
      data: authTest
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du statut:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la vérification du statut',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
