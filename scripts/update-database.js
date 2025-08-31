const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDatabase() {
  try {
    console.log('🔄 Mise à jour de la base de données...');
    
    // Cette commande va appliquer les changements du schéma
    const { execSync } = require('child_process');
    
    console.log('📝 Application des changements Prisma...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    console.log('✅ Base de données mise à jour avec succès !');
    
    // Vérifier que les nouveaux champs existent
    const testMessage = await prisma.message.findFirst();
    if (testMessage) {
      console.log('📊 Exemple de message:', {
        id: testMessage.id,
        hasPhoneNumber: testMessage.hasOwnProperty('phoneNumber'),
        hasProvider: testMessage.hasOwnProperty('provider'),
        hasExternalId: testMessage.hasOwnProperty('externalId'),
        hasMetadata: testMessage.hasOwnProperty('metadata')
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDatabase();
