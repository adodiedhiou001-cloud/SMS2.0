// Service pour gérer l'envoi des campagnes programmées
import { prisma } from '@/lib/prisma';
import { smsService } from './sms/sms-service';

export class CampaignSchedulerService {
  private static instance: CampaignSchedulerService;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  static getInstance(): CampaignSchedulerService {
    if (!CampaignSchedulerService.instance) {
      CampaignSchedulerService.instance = new CampaignSchedulerService();
    }
    return CampaignSchedulerService.instance;
  }

  /**
   * Démarrer le planificateur de campagnes
   */
  start(intervalMinutes = 1): void {
    if (this.isRunning) {
      console.log('⚠️ Le planificateur est déjà en cours d\'exécution');
      return;
    }

    console.log(`🚀 Démarrage du planificateur de campagnes (vérification toutes les ${intervalMinutes} minute(s))`);
    
    this.isRunning = true;
    this.intervalId = setInterval(async () => {
      await this.checkAndSendScheduledCampaigns();
    }, intervalMinutes * 60 * 1000); // Conversion en millisecondes

    // Exécuter une première vérification immédiatement
    this.checkAndSendScheduledCampaigns();
  }

  /**
   * Arrêter le planificateur
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Planificateur de campagnes arrêté');
  }

  /**
   * Vérifier et envoyer les campagnes programmées
   */
  async checkAndSendScheduledCampaigns(): Promise<void> {
    try {
      const now = new Date();
      
      // Récupérer les campagnes programmées dont l'heure est arrivée
      const scheduledCampaigns = await prisma.campaign.findMany({
        where: {
          status: 'scheduled',
          scheduledAt: {
            lte: now // Campagnes dont la date programmée est passée ou égale à maintenant
          }
        },
        include: {
          messages: {
            where: {
              status: 'scheduled'
            },
            include: {
              contact: true
            }
          }
        }
      });

      if (scheduledCampaigns.length === 0) {
        // console.log('✅ Aucune campagne programmée à envoyer');
        return;
      }

      console.log(`📅 ${scheduledCampaigns.length} campagne(s) programmée(s) à envoyer`);

      // Traiter chaque campagne
      for (const campaign of scheduledCampaigns) {
        await this.sendScheduledCampaign(campaign);
      }

    } catch (error) {
      console.error('❌ Erreur lors de la vérification des campagnes programmées:', error);
    }
  }

  /**
   * Envoyer une campagne programmée spécifique
   */
  private async sendScheduledCampaign(campaign: any): Promise<void> {
    try {
      console.log(`📱 Envoi de la campagne programmée: "${campaign.name}"`);

      // Extraire les numéros de téléphone et contacts
      const phoneNumbers: string[] = [];
      const contactMap: { [phone: string]: any } = {};

      campaign.messages.forEach((message: any) => {
        if (message.contact?.phone) {
          phoneNumbers.push(message.contact.phone);
          contactMap[message.contact.phone] = message.contact;
        }
      });

      if (phoneNumbers.length === 0) {
        console.log(`⚠️ Aucun numéro valide trouvé pour la campagne "${campaign.name}"`);
        
        // Marquer la campagne comme échouée
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'failed' }
        });
        
        return;
      }

      // Envoyer les SMS
      const smsResult = await smsService.sendBulkSMS(phoneNumbers, campaign.message);

      // Mettre à jour le statut de la campagne
      const finalStatus = smsResult.failed === 0 ? 'sent' : 'partially_sent';
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          status: finalStatus,
          sentAt: new Date()
        }
      });

      // Mettre à jour les statuts des messages
      await Promise.all(
        smsResult.results.map(async (smsRes) => {
          const contact = contactMap[smsRes.phoneNumber];
          if (contact) {
            return prisma.message.updateMany({
              where: {
                campaignId: campaign.id,
                contactId: contact.id
              },
              data: {
                status: smsRes.result.success ? 'sent' : 'failed',
                sentAt: smsRes.result.success ? new Date() : null,
                provider: 'Orange Sénégal',
                externalId: smsRes.result.messageId,
                metadata: JSON.stringify({
                  error: smsRes.result.error,
                  provider: 'Orange Sénégal',
                  scheduledSent: true
                })
              }
            });
          }
        })
      );

      // Log d'audit
      await prisma.auditLog.create({
        data: {
          action: 'scheduled_campaign_sent',
          resource: 'campaign',
          resourceId: campaign.id,
          userId: campaign.createdBy,
          organizationId: campaign.organizationId,
          metadata: JSON.stringify({
            campaignName: campaign.name,
            scheduledAt: campaign.scheduledAt,
            sentAt: new Date(),
            recipientCount: phoneNumbers.length,
            successCount: smsResult.success,
            failedCount: smsResult.failed
          })
        }
      });

      console.log(`✅ Campagne "${campaign.name}" envoyée: ${smsResult.success} succès, ${smsResult.failed} échecs`);

    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi de la campagne "${campaign.name}":`, error);
      
      // Marquer la campagne comme échouée
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: 'failed' }
      });
    }
  }

  /**
   * Envoyer manuellement une campagne programmée spécifique
   */
  async sendCampaignNow(campaignId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          messages: {
            include: {
              contact: true
            }
          }
        }
      });

      if (!campaign) {
        return { success: false, error: 'Campagne non trouvée' };
      }

      if (campaign.status !== 'scheduled') {
        return { success: false, error: 'La campagne n\'est pas programmée' };
      }

      await this.sendScheduledCampaign(campaign);
      return { success: true };

    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi manuel:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtenir l'état du planificateur
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalId: !!this.intervalId
    };
  }
}

// Instance singleton
export const campaignScheduler = CampaignSchedulerService.getInstance();
