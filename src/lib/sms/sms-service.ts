// Service SMS générique qui peut utiliser différents providers
import { orangeSMSService } from './orange-service';

export interface SMSProvider {
  name: string;
  sendSMS(phoneNumber: string, message: string): Promise<SMSResult>;
  sendBulkSMS(phoneNumbers: string[], message: string): Promise<BulkSMSResult>;
  testConfiguration(): Promise<{ success: boolean; error?: string }>;
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

export interface BulkSMSResult {
  success: number;
  failed: number;
  results: Array<{ phoneNumber: string; result: SMSResult }>;
}

export enum SMSStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed'
}

class SMSService {
  private provider: SMSProvider;

  constructor() {
    // Par défaut, utiliser Orange Sénégal
    this.provider = {
      name: 'Orange Sénégal',
      sendSMS: orangeSMSService.sendSMS.bind(orangeSMSService),
      sendBulkSMS: orangeSMSService.sendBulkSMS.bind(orangeSMSService),
      testConfiguration: orangeSMSService.testConfiguration.bind(orangeSMSService)
    };
  }

  /**
   * Envoyer un SMS simple
   */
  async sendSMS(phoneNumber: string, message: string): Promise<SMSResult> {
    console.log(`📱 Envoi SMS via ${this.provider.name} vers ${phoneNumber}`);
    
    try {
      const result = await this.provider.sendSMS(phoneNumber, message);
      
      // Log pour audit
      console.log(`${result.success ? '✅' : '❌'} SMS ${result.success ? 'envoyé' : 'échoué'}:`, {
        provider: this.provider.name,
        to: phoneNumber,
        success: result.success,
        messageId: result.messageId,
        error: result.error
      });

      return result;
    } catch (error: any) {
      console.error('💥 Erreur service SMS:', error);
      return {
        success: false,
        error: error.message || 'Erreur inconnue'
      };
    }
  }

  /**
   * Envoyer des SMS en masse
   */
  async sendBulkSMS(phoneNumbers: string[], message: string): Promise<BulkSMSResult> {
    console.log(`📱 Envoi SMS en masse via ${this.provider.name} vers ${phoneNumbers.length} destinataires`);
    
    try {
      const result = await this.provider.sendBulkSMS(phoneNumbers, message);
      
      // Log pour audit
      console.log(`✅ Envoi en masse terminé:`, {
        provider: this.provider.name,
        total: phoneNumbers.length,
        success: result.success,
        failed: result.failed,
        successRate: `${Math.round((result.success / phoneNumbers.length) * 100)}%`
      });

      return result;
    } catch (error: any) {
      console.error('💥 Erreur envoi en masse:', error);
      return {
        success: 0,
        failed: phoneNumbers.length,
        results: phoneNumbers.map(phoneNumber => ({
          phoneNumber,
          result: {
            success: false,
            error: error.message || 'Erreur inconnue'
          }
        }))
      };
    }
  }

  /**
   * Tester la configuration du provider
   */
  async testConfiguration(): Promise<{ success: boolean; error?: string }> {
    return await this.provider.testConfiguration();
  }

  /**
   * Obtenir des informations sur le provider actuel
   */
  getProviderInfo() {
    return {
      name: this.provider.name,
      configured: true // Sera étendu selon le provider
    };
  }

  /**
   * Valider un numéro de téléphone
   */
  validatePhoneNumber(phoneNumber: string): { valid: boolean; formatted?: string; error?: string } {
    // Nettoyer le numéro
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Formats sénégalais acceptés
    if (cleaned.match(/^\+221[0-9]{9}$/)) {
      return { valid: true, formatted: cleaned };
    }
    
    if (cleaned.match(/^221[0-9]{9}$/)) {
      return { valid: true, formatted: `+${cleaned}` };
    }
    
    if (cleaned.match(/^[0-9]{9}$/) && (cleaned.startsWith('7') || cleaned.startsWith('3'))) {
      return { valid: true, formatted: `+221${cleaned}` };
    }

    return { 
      valid: false, 
      error: 'Format invalide. Attendu: +221XXXXXXXXX (numéro sénégalais)' 
    };
  }

  /**
   * Calculer le nombre de SMS nécessaires pour un message
   */
  calculateSMSCount(message: string): number {
    const smsLength = 160; // Longueur standard d'un SMS
    const unicodeLength = 70; // Longueur pour les caractères unicode
    
    // Vérifier si le message contient des caractères spéciaux
    const hasUnicode = /[^\x00-\x7F]/.test(message);
    const maxLength = hasUnicode ? unicodeLength : smsLength;
    
    return Math.ceil(message.length / maxLength);
  }

  /**
   * Estimer le coût d'envoi (à adapter selon les tarifs Orange)
   */
  estimateCost(phoneNumbers: string[], message: string): {
    smsCount: number;
    totalSMS: number;
    estimatedCost: number; // En FCFA
  } {
    const smsPerMessage = this.calculateSMSCount(message);
    const totalSMS = phoneNumbers.length * smsPerMessage;
    
    // Coût estimé par SMS (à adapter selon les tarifs réels)
    const costPerSMS = 25; // 25 FCFA par SMS (tarif indicatif)
    const estimatedCost = totalSMS * costPerSMS;

    return {
      smsCount: smsPerMessage,
      totalSMS,
      estimatedCost
    };
  }
}

// Instance singleton du service SMS
export const smsService = new SMSService();
