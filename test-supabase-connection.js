require('dotenv').config({path: '.env.supabase'});

console.log('🎉 CONFIGURATION SUPABASE COMPLÈTE');
console.log('=====================================\n');

console.log('✅ SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('✅ SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Configuré (' + process.env.SUPABASE_ANON_KEY.substring(0, 20) + '...)' : 'Manquant');
console.log('✅ SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configuré (' + process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...)' : 'Manquant');
console.log('✅ DATABASE_URL:', process.env.DATABASE_URL.includes('Coran.114') ? 'Configuré avec mot de passe' : 'Problème');

console.log('\n🧪 Test de connexion Supabase...');

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

(async () => {
  try {
    console.log('🔄 Tentative de connexion...');
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('🎯 CONNEXION RÉUSSIE!');
    console.log('📊 Version PostgreSQL:', result[0].version.substring(0, 50) + '...');
    console.log('\n🚀 PRÊT POUR LA MIGRATION!');
    console.log('=====================================');
    console.log('Exécutez maintenant:');
    console.log('1. node setup-supabase.js');
    console.log('2. node migrate-to-supabase.js');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('💡 Solution: Vérifiez le mot de passe dans DATABASE_URL');
    } else if (error.message.includes('connect')) {
      console.log('💡 Solution: Vérifiez que le projet Supabase est actif');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Solution: Problème réseau, réessayez dans quelques minutes');
    }
  } finally {
    await prisma.$disconnect();
  }
})();
