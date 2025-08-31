// Service de simulation SMS (pour tests sans contrat Orange)
export class SimulatedSMSService {
  constructor() {
    console.log('🧪 Mode simulation SMS activé (contrat Orange expiré)');
  }

  async sendSMS(phoneNumber: string, message: string): Promise<any> {
    console.log('📱 SIMULATION - Envoi SMS');
    console.log(`📞 Destinataire: ${phoneNumber}`);
    console.log(`💬 Message: ${message}`);
    
    // Simuler un délai d'envoi
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simuler le succès
    return {
      success: true,
      provider: 'Orange Sénégal (Simulation)',
      messageId: `sim_${Date.now()}`,
      phoneNumber,
      message,
      timestamp: new Date().toISOString(),
      status: 'delivered'
    };
  }

  async sendBulkSMS(phoneNumbers: string[], message: string): Promise<any> {
    console.log('📱 SIMULATION - Envoi SMS en masse');
    console.log(`📞 Destinataires: ${phoneNumbers.length}`);
    console.log(`💬 Message: ${message}`);
    
    const results = [];
    
    for (const phoneNumber of phoneNumbers) {
      console.log(`📤 Simulation envoi vers ${phoneNumber}...`);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      results.push({
        phoneNumber,
        success: true,
        messageId: `sim_${Date.now()}_${Math.random()}`,
        status: 'delivered'
      });
    }
    
    return {
      provider: 'Orange Sénégal (Simulation)',
      total: phoneNumbers.length,
      success: phoneNumbers.length,
      failed: 0,
      successRate: '100%',
      results
    };
  }
}
