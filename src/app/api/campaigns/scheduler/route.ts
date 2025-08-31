import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth/service';
import { campaignScheduler } from '@/lib/campaign-scheduler';

// Démarrer le planificateur
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
    
    if (!authResult || authResult.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès admin requis' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, intervalMinutes = 1 } = body;

    if (action === 'start') {
      campaignScheduler.start(intervalMinutes);
      
      return NextResponse.json({
        success: true,
        message: 'Planificateur de campagnes démarré',
        status: campaignScheduler.getStatus()
      });
    } else if (action === 'stop') {
      campaignScheduler.stop();
      
      return NextResponse.json({
        success: true,
        message: 'Planificateur de campagnes arrêté',
        status: campaignScheduler.getStatus()
      });
    } else {
      return NextResponse.json(
        { error: 'Action non valide. Utilisez "start" ou "stop"' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('❌ Erreur planificateur:', error);
    
    return NextResponse.json(
      { error: 'Erreur du planificateur' },
      { status: 500 }
    );
  }
}

// Obtenir le statut du planificateur
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

    const status = campaignScheduler.getStatus();
    
    return NextResponse.json({
      success: true,
      data: {
        scheduler: status,
        features: {
          automaticSending: true,
          scheduledCampaigns: true,
          bulkSMS: true
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur statut planificateur:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut' },
      { status: 500 }
    );
  }
}
