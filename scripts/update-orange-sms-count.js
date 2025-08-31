// Script pour mettre à jour le compteur de SMS utilisés Orange
// Usage: node scripts/update-orange-sms-count.js [nombre_sms_utilisés]

const fs = require('fs');
const path = require('path');

const COUNTER_FILE = path.join(__dirname, '..', 'orange-sms-counter.json');

function updateSMSCount(usedSMS) {
  const data = {
    bundleSize: 25,
    usedSMS: parseInt(usedSMS) || 0,
    remainingSMS: 25 - (parseInt(usedSMS) || 0),
    lastUpdated: new Date().toISOString()
  };

  fs.writeFileSync(COUNTER_FILE, JSON.stringify(data, null, 2));
  
  console.log('📱 Compteur SMS Orange mis à jour:');
  console.log(`   Bundle: 25 SMS`);
  console.log(`   Utilisés: ${data.usedSMS} SMS`);
  console.log(`   Restants: ${data.remainingSMS} SMS`);
  console.log(`   Dernière mise à jour: ${data.lastUpdated}`);
}

function getCurrentCount() {
  try {
    if (fs.existsSync(COUNTER_FILE)) {
      const data = JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf8'));
      return data.usedSMS || 0;
    }
  } catch (error) {
    console.error('Erreur lecture fichier:', error);
  }
  return 0;
}

// Obtenir le nombre de SMS depuis les arguments de ligne de commande
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('🔍 Affichage du compteur actuel:');
  const current = getCurrentCount();
  console.log(`   SMS utilisés: ${current}/25`);
  console.log(`   SMS restants: ${25 - current}/25`);
  console.log('');
  console.log('💡 Pour mettre à jour: node scripts/update-orange-sms-count.js [nombre]');
  console.log('   Exemple: node scripts/update-orange-sms-count.js 5');
} else {
  const newCount = parseInt(args[0]);
  if (isNaN(newCount) || newCount < 0 || newCount > 25) {
    console.error('❌ Erreur: Le nombre doit être entre 0 et 25');
    process.exit(1);
  }
  
  updateSMSCount(newCount);
}

module.exports = { getCurrentCount, updateSMSCount };
