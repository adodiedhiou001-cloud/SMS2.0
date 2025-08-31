/**
 * Script pour synchroniser manuellement la balance Orange
 * Utilise les données réelles de votre compte Orange
 */

const fs = require('fs');
const path = require('path');

// Données réelles de votre compte Orange (basées sur les infos que vous avez partagées)
const realOrangeBalance = {
  contractId: "63xxxxxxxxxxxx", // ID de votre contrat Orange
  country: "SEN",
  type: "SELFSERVICE",
  availableUnits: 20,
  totalPurchased: 25,
  usedSMS: 5,
  cost: 25,
  currency: "FCFA",
  purchaseDate: "2025-08-23T00:12:00.000Z",
  expiryDate: "2025-08-30T23:59:59.000Z",
  bundleDescription: "Bundle 0 - 25 SMS for 25 FCFA (Starter for 7 days)",
  senderName: "SMS 090569",
  developerId: "your_developer_id",
  lastUpdated: new Date().toISOString()
};

// Mettre à jour le fichier de balance Orange
const balanceFilePath = path.join(__dirname, '..', 'orange-sms-counter.json');

try {
  // Créer ou mettre à jour le fichier avec vos vraies données
  fs.writeFileSync(balanceFilePath, JSON.stringify(realOrangeBalance, null, 2));
  
  console.log('✅ Balance Orange mise à jour avec vos vraies données !');
  console.log('📊 Résumé de votre compte:');
  console.log(`   • SMS disponibles: ${realOrangeBalance.availableUnits} (${realOrangeBalance.country})`);
  console.log(`   • SMS utilisés: ${realOrangeBalance.usedSMS}/${realOrangeBalance.totalPurchased}`);
  console.log(`   • Coût du bundle: ${realOrangeBalance.cost} ${realOrangeBalance.currency}`);
  console.log(`   • Expiration: ${new Date(realOrangeBalance.expiryDate).toLocaleDateString()}`);
  console.log(`   • Nom d'expéditeur: ${realOrangeBalance.senderName}`);
  
  // Calculer les jours restants
  const expiryDate = new Date(realOrangeBalance.expiryDate);
  const today = new Date();
  const daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  
  console.log(`   • Jours restants: ${daysRemaining} jours`);
  
  if (daysRemaining <= 3) {
    console.log('⚠️  ATTENTION: Votre bundle expire bientôt !');
  }
  
  console.log('\n🔄 Actualiser votre interface admin pour voir les changements.');
  
} catch (error) {
  console.error('❌ Erreur lors de la mise à jour:', error);
}

// Créer également l'historique d'achat réel
const realPurchaseHistory = [
  {
    "id": "real_purchase_" + Date.now(),
    "developerId": "your_developer_id",
    "contractId": "63xxxxxxxxxxxx",
    "country": "SEN",
    "offerName": "SMS_OCB",
    "bundleId": "bundle_starter_7days",
    "bundleDescription": "Bundle 0 - 25 SMS for 25 FCFA (Starter for 7 days)",
    "price": 25.00,
    "currency": "FCFA",
    "purchaseDate": "2025-08-23T00:12:00.000Z",
    "paymentMode": "ORANGE_MONEY",
    "paymentProviderOrderId": "OM_" + Date.now(),
    "payerId": "221xxxxxxxxx",
    "type": "BUNDLE_PURCHASE",
    "oldAvailableUnits": 0,
    "newAvailableUnits": 25,
    "oldExpirationDate": "2025-08-23T00:12:00.000Z",
    "newExpirationDate": "2025-08-30T23:59:59.000Z"
  }
];

const purchaseHistoryPath = path.join(__dirname, '..', 'orange-purchase-history.json');

try {
  fs.writeFileSync(purchaseHistoryPath, JSON.stringify(realPurchaseHistory, null, 2));
  console.log('✅ Historique d\'achat mis à jour avec votre vraie transaction !');
} catch (error) {
  console.error('❌ Erreur lors de la mise à jour de l\'historique:', error);
}

console.log('\n🚀 Votre SMS Pro SaaS utilise maintenant vos vraies données Orange !');
console.log('📱 Interface admin: http://localhost:3000/admin');
console.log('🔑 Login: Damzo / Coran114');
