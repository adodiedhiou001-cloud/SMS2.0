// Service d'intégration Orange Sénégal SMS API
// Documentation: https://developer.orange.com/apis/sms-senegal/

interface OrangeTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface OrangeSMSRequest {
  outboundSMSMessageRequest: {
    address: string[];
    senderAddress: string;
    outboundSMSTextMessage: {
      message: string;
    };
  };
}

interface OrangeSMSResponse {
  outboundSMSMessageRequest: {
    address: string[];
    senderAddress: string;
    outboundSMSTextMessage: {
      message: string;
    };
    requestIdentifier: string;
    resourceURL: string;
  };
}

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

export class OrangeSMSService {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private senderName: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.clientId = process.env.ORANGE_SMS_CLIENT_ID || '';
    this.clientSecret = process.env.ORANGE_SMS_CLIENT_SECRET || '';
    this.baseUrl = process.env.ORANGE_SMS_BASE_URL || 'https://api.orange.com';
    this.senderName = process.env.ORANGE_SMS_SENDER_NAME || 'SMS Pro';

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Orange SMS credentials not configured. Please set ORANGE_SMS_CLIENT_ID and ORANGE_SMS_CLIENT_SECRET in environment variables.');
    }
  }

  /**
   * Obtenir un token d'accès OAuth2
   */
  private async getAccessToken(): Promise<string> {
    try {
      // Vérifier si le token existant est encore valide
      if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.accessToken;
      }

      console.log('🔑 Obtention d\'un nouveau token Orange SMS...');

      const response = await fetch(`${this.baseUrl}/oauth/v3/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get Orange SMS token: ${response.status} - ${errorText}`);
      }

      const tokenData: OrangeTokenResponse = await response.json();
      
      this.accessToken = tokenData.access_token;
      // Le token expire dans expires_in secondes, on retire 5 minutes de sécurité
      this.tokenExpiry = new Date(Date.now() + (tokenData.expires_in - 300) * 1000);

      console.log('✅ Token Orange SMS obtenu avec succès');
      return this.accessToken;

    } catch (error) {
      console.error('❌ Erreur lors de l\'obtention du token Orange SMS:', error);
      throw new Error('Impossible d\'obtenir le token d\'authentification Orange SMS');
    }
  }

  /**
   * Envoyer un SMS via l'API Orange Sénégal
   */
  async sendSMS(phoneNumber: string, message: string): Promise<SMSResult> {
    try {
      console.log(`📱 Envoi SMS vers ${phoneNumber}...`);

      // Valider le numéro de téléphone (format sénégalais)
      const cleanedNumber = this.formatPhoneNumber(phoneNumber);
      if (!cleanedNumber) {
        return {
          success: false,
          error: 'Numéro de téléphone invalide. Format attendu: +221XXXXXXXXX'
        };
      }

      // Obtenir le token d'accès
      const token = await this.getAccessToken();

      // Préparer la requête SMS
      const smsData: OrangeSMSRequest = {
        outboundSMSMessageRequest: {
          address: [`tel:${cleanedNumber}`],
          senderAddress: `tel:${this.senderName}`,
          outboundSMSTextMessage: {
            message: message.trim()
          }
        }
      };

      console.log('📤 Envoi de la requête SMS à Orange...', {
        to: cleanedNumber,
        messageLength: message.length
      });

      const response = await fetch(`${this.baseUrl}/smsmessaging/v1/outbound/tel%3A${encodeURIComponent(this.senderName)}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(smsData),
        // Augmenter le timeout pour éviter les timeouts de passerelle
        signal: AbortSignal.timeout(45000), // 45 secondes pour éviter POL2204
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur Orange SMS API:', response.status, errorText);
        
        // Analyser l'erreur spécifique
        let errorMessage = `HTTP ${response.status}`;
        let shouldFallbackToSimulation = false;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.requestError?.serviceException) {
            const exception = errorData.requestError.serviceException;
            errorMessage = `${exception.messageId}: ${exception.text}`;
            
            // Identifier les erreurs qui nécessitent un fallback
            if (exception.messageId === 'SVC0001') {
              const variables = exception.variables || [];
              if (variables.some((v: any) => v.includes('timeout') || v.includes('POL2204'))) {
                console.log('⚠️ Erreur Orange POL2204/timeout détectée - Basculement en mode simulation');
                shouldFallbackToSimulation = true;
                errorMessage = 'Orange Gateway Timeout (POL2204) - Mode simulation activé';
              }
            }
          }
        } catch (e) {
          // Erreur de parsing JSON, utiliser le texte brut
        }
        
        // TEMPORAIREMENT DÉSACTIVÉ - Mode simulation désactivé pour diagnostic
        if (shouldFallbackToSimulation) {
          console.log(`❌ ERREUR ORANGE RÉELLE - Simulation désactivée pour diagnostic`);
          console.log(`🔍 Erreur: ${errorMessage}`);
          console.log(`📱 SMS vers ${cleanedNumber} - ÉCHEC RÉEL (pas de simulation)`);
          
          // Retourner l'erreur réelle au lieu de simuler
          return {
            success: false,
            error: errorMessage,
            details: {
              provider: 'Orange Sénégal',
              realError: 'Timeout de la passerelle Orange - SMS non envoyé',
              originalError: errorMessage,
              timestamp: new Date().toISOString(),
              phoneNumber: cleanedNumber,
              message: message.substring(0, 50) + '...',
              simulationDisabled: true
            }
          };
        }
        
        return {
          success: false,
          error: `Erreur Orange SMS API: ${response.status}`,
          details: errorText
        };
      }

      const responseData: OrangeSMSResponse = await response.json();
      
      console.log('✅ SMS envoyé avec succès via Orange');
      
      return {
        success: true,
        messageId: responseData.outboundSMSMessageRequest.requestIdentifier,
        details: responseData
      };

    } catch (error: any) {
      console.error('💥 Erreur lors de l\'envoi SMS Orange:', error);
      
      return {
        success: false,
        error: error.message || 'Erreur inconnue lors de l\'envoi SMS',
        details: error
      };
    }
  }

  /**
   * Envoyer des SMS en masse
   */
  async sendBulkSMS(phoneNumbers: string[], message: string): Promise<{
    success: number;
    failed: number;
    results: Array<{ phoneNumber: string; result: SMSResult }>;
  }> {
    console.log(`📱 Envoi SMS en masse vers ${phoneNumbers.length} destinataires...`);

    const results: Array<{ phoneNumber: string; result: SMSResult }> = [];
    let successCount = 0;
    let failedCount = 0;

    // Traitement par batch pour éviter de surcharger l'API
    const batchSize = 10;
    
    for (let i = 0; i < phoneNumbers.length; i += batchSize) {
      const batch = phoneNumbers.slice(i, i + batchSize);
      
      // Traitement parallèle du batch avec délai
      const batchPromises = batch.map(async (phoneNumber, index) => {
        // Ajouter un délai progressif pour éviter les timeouts
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, 500 * index));
        }
        
        const result = await this.sendSMS(phoneNumber, message);
        
        if (result.success) {
          successCount++;
        } else {
          failedCount++;
        }

        return { phoneNumber, result };
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Pause entre les batches pour respecter les limites de l'API
      if (i + batchSize < phoneNumbers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 seconde de pause
      }
    }

    console.log(`✅ Envoi terminé: ${successCount} succès, ${failedCount} échecs`);

    return {
      success: successCount,
      failed: failedCount,
      results
    };
  }

  /**
   * Formater un numéro de téléphone sénégalais
   */
  private formatPhoneNumber(phoneNumber: string): string | null {
    // Nettoyer le numéro
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Vérifier les formats sénégalais
    if (cleaned.match(/^\+221[0-9]{9}$/)) {
      return cleaned; // Déjà au bon format
    }
    
    if (cleaned.match(/^221[0-9]{9}$/)) {
      return `+${cleaned}`;
    }
    
    if (cleaned.match(/^[0-9]{9}$/) && (cleaned.startsWith('7') || cleaned.startsWith('3'))) {
      return `+221${cleaned}`;
    }

    // Format invalide
    return null;
  }

  /**
   * Vérifier la configuration Orange SMS
   */
  async testConfiguration(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.getAccessToken();
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Vérifier le statut du compte Orange SMS
   */
  async getAccountStatus(): Promise<any> {
    try {
      console.log('🔍 Vérification du statut du compte Orange...');
      
      // Test d'authentification pour vérifier la validité
      const token = await this.getAccessToken();
      
      if (!token) {
        return {
          status: 'error',
          message: 'Impossible d\'obtenir le token d\'authentification'
        };
      }
      
      // Test avec un numéro factice pour vérifier les permissions
      const testData = {
        outboundSMSMessageRequest: {
          address: ["tel:+221000000000"], // Numéro factice
          senderAddress: `tel:+221338220001`,
          outboundSMSTextMessage: {
            message: "test"
          }
        }
      };

      const response = await fetch(`${this.baseUrl}/smsmessaging/v1/outbound/tel%3A%2B221338220001/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(testData),
        signal: AbortSignal.timeout(10000), // 10 secondes pour le test
      });

      const responseText = await response.text();
      
      // Analyser la réponse pour déterminer le statut
      if (response.status === 201) {
        return {
          status: 'active',
          message: 'Compte Orange actif avec crédits disponibles',
          details: 'API fonctionnelle'
        };
      } else if (response.status === 400) {
        // Erreur 400 avec numéro factice = compte actif mais numéro invalide
        if (responseText.includes('invalid')) {
          return {
            status: 'active',
            message: 'Compte Orange actif (test avec numéro factice)',
            details: 'API fonctionnelle, prête pour l\'envoi'
          };
        }
      } else if (response.status === 403) {
        if (responseText.includes('Expired contract')) {
          return {
            status: 'expired',
            message: 'Contrat Orange expiré',
            details: 'Veuillez renouveler votre contrat'
          };
        } else if (responseText.includes('insufficient credits')) {
          return {
            status: 'no_credits',
            message: 'Crédits SMS épuisés',
            details: 'Veuillez recharger votre compte'
          };
        }
      }
      
      return {
        status: 'unknown',
        message: `Statut inconnu (${response.status})`,
        details: responseText
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du statut:', error);
      return {
        status: 'error',
        message: 'Erreur de connexion à l\'API Orange',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Obtenir les informations de statut du service
   */
  getServiceInfo() {
    return {
      provider: 'Orange Sénégal',
      configured: !!(this.clientId && this.clientSecret),
      senderName: this.senderName,
      tokenValid: this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry
    };
  }
}

// Instance singleton du service
export const orangeSMSService = new OrangeSMSService();
