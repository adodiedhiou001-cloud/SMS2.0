const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCurrentData() {
  try {
    console.log('🔍 Vérification des données actuelles...\n');
    
    const organizations = await prisma.organization.count();
    const users = await prisma.user.count();
    const campaigns = await prisma.campaign.count();
    const contacts = await prisma.contact.count();
    
    console.log('📈 Données actuelles dans SQLite:');
    console.log('   - Organizations:', organizations);
    console.log('   - Users:', users);
    console.log('   - Campaigns:', campaigns);
    console.log('   - Contacts:', contacts);
    
    if (organizations > 0) {
      console.log('\n✅ Données trouvées - Migration nécessaire');
      
      // Afficher un échantillon des données
      const orgSample = await prisma.organization.findFirst({
        include: {
          users: true,
          campaigns: true,
          contacts: true
        }
      });
      
      if (orgSample) {
        console.log('\n📋 Échantillon d\'organisation:');
        console.log('   - Nom:', orgSample.name);
        console.log('   - ID:', orgSample.id);
        console.log('   - Utilisateurs:', orgSample.users.length);
        console.log('   - Campagnes:', orgSample.campaigns.length);
        console.log('   - Contacts:', orgSample.contacts.length);
      }
    } else {
      console.log('\n⚠️ Aucune donnée trouvée');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentData();
