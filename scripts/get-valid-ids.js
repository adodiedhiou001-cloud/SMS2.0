const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getValidIds() {
  try {
    console.log('🔍 Recherche d\'IDs valides...');
    
    const user = await prisma.user.findFirst({
      include: {
        organization: true
      }
    });
    
    if (user) {
      console.log('✅ Utilisateur trouvé:');
      console.log('   ID utilisateur:', user.id);
      console.log('   Username:', user.username);
      console.log('   ID organisation:', user.organizationId);
      console.log('   Nom organisation:', user.organization.name);
    } else {
      console.log('❌ Aucun utilisateur trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getValidIds();
