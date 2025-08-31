// Script d'initialisation pour démarrer le planificateur de campagnes
import { campaignScheduler } from '@/lib/campaign-scheduler';

// Ne démarrer le planificateur que en production serveur pour éviter
// les longues initialisations et appels externes pendant le développement.
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  try {
    console.log('🚀 Initialisation du planificateur de campagnes SMS (production)...');
    // Démarrer le planificateur avec vérification toutes les minutes
    campaignScheduler.start(1);
    console.log('✅ Planificateur démarré - Les campagnes programmées seront envoyées automatiquement');
  } catch (e) {
    console.error('❌ Erreur lors du démarrage du planificateur de campagnes:', e);
  }
}

export { campaignScheduler };
