// API de test pour Orange SMS
import { NextRequest, NextResponse } from 'next/server';
import { OrangeSMSService } from '@/lib/sms/orange-service';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json();
    
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Numéro de téléphone et message requis' },
        { status: 400 }
      );
    }
    
    console.log('🧪 Test d\'envoi SMS Orange...');
    console.log(`📱 Destinataire: ${phoneNumber}`);
    console.log(`💬 Message: ${message}`);
    
    const orangeService = new OrangeSMSService();
    
    // Test d'envoi de SMS
    const result = await orangeService.sendSMS(phoneNumber, message);
    
    console.log('✅ SMS envoyé avec succès!', result);
    
    return NextResponse.json({
      success: true,
      message: 'SMS envoyé avec succès',
      data: result
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi SMS:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'envoi SMS',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de test SMS Orange',
    usage: 'POST avec { phoneNumber: "+221XXXXXXXXX", message: "Votre message" }'
  });
}
