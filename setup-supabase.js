const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 CONFIGURATION PRISMA POUR SUPABASE');
console.log('=====================================\n');

async function setupPrismaForSupabase() {
  try {
    // 1. Charger les variables Supabase
    console.log('📁 Chargement de la configuration Supabase...');
    require('dotenv').config({ path: '.env.supabase' });
    
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('your-project-id')) {
      console.error('❌ DATABASE_URL non configuré dans .env.supabase');
      console.log('💡 Configurez d\'abord vos credentials Supabase');
      process.exit(1);
    }
    
    // 2. Sauvegarder la configuration SQLite actuelle
    console.log('💾 Sauvegarde de la configuration SQLite...');
    const envContent = fs.readFileSync('.env.local', 'utf8');
    fs.writeFileSync('.env.sqlite.backup', envContent);
    console.log('✅ Sauvegarde créée: .env.sqlite.backup');
    
    // 3. Mettre à jour .env.local avec Supabase
    console.log('🔄 Mise à jour de .env.local avec Supabase...');
    
    let newEnvContent = envContent;
    
    // Remplacer ou ajouter DATABASE_URL
    if (newEnvContent.includes('DATABASE_URL=')) {
      newEnvContent = newEnvContent.replace(
        /DATABASE_URL=.*/,
        `DATABASE_URL="${process.env.DATABASE_URL}"`
      );
    } else {
      newEnvContent += `\nDATABASE_URL="${process.env.DATABASE_URL}"`;
    }
    
    // Ajouter les variables Supabase
    if (!newEnvContent.includes('SUPABASE_URL=')) {
      newEnvContent += `\nSUPABASE_URL="${process.env.SUPABASE_URL}"`;
    }
    
    if (!newEnvContent.includes('SUPABASE_ANON_KEY=')) {
      newEnvContent += `\nSUPABASE_ANON_KEY="${process.env.SUPABASE_ANON_KEY}"`;
    }
    
    if (!newEnvContent.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
      newEnvContent += `\nSUPABASE_SERVICE_ROLE_KEY="${process.env.SUPABASE_SERVICE_ROLE_KEY}"`;
    }
    
    fs.writeFileSync('.env.local', newEnvContent);
    console.log('✅ .env.local mis à jour avec Supabase');
    
    // 4. Générer et appliquer les migrations Prisma
    console.log('🔧 Configuration du schéma Prisma pour PostgreSQL...');
    
    try {
      // Reset et création de la migration initiale
      console.log('📝 Création de la migration initiale...');
      execSync('npx prisma migrate dev --name init_supabase', { 
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
      });
      
      console.log('✅ Migration Prisma créée et appliquée');
      
      // Générer le client Prisma
      console.log('🔄 Génération du client Prisma...');
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Client Prisma généré');
      
    } catch (error) {
      console.error('❌ Erreur lors de la migration Prisma:', error.message);
      throw error;
    }
    
    console.log('\n🎯 CONFIGURATION TERMINÉE!');
    console.log('=====================================');
    console.log('✅ Prisma configuré pour Supabase');
    console.log('✅ Variables d\'environnement mises à jour');
    console.log('✅ Migration initiale appliquée');
    console.log('\n🚀 Vous pouvez maintenant exécuter la migration des données:');
    console.log('   node migrate-to-supabase.js');
    
  } catch (error) {
    console.error('\n❌ ERREUR DE CONFIGURATION:', error.message);
    
    // Restaurer la sauvegarde en cas d'erreur
    if (fs.existsSync('.env.sqlite.backup')) {
      console.log('🔄 Restauration de la configuration SQLite...');
      const backupContent = fs.readFileSync('.env.sqlite.backup', 'utf8');
      fs.writeFileSync('.env.local', backupContent);
      console.log('✅ Configuration SQLite restaurée');
    }
  }
}

setupPrismaForSupabase();
