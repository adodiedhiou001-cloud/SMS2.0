const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 CONFIGURATION INTERACTIVE SUPABASE');
console.log('=====================================\n');

console.log('📖 Instructions:');
console.log('1. Allez sur https://supabase.com/dashboard');
console.log('2. Sélectionnez votre projet');
console.log('3. Suivez les instructions ci-dessous\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function configureSupabase() {
  try {
    console.log('🌐 ÉTAPE 1: URL du projet');
    console.log('   • Dans votre dashboard Supabase, copiez l\'URL de votre projet');
    console.log('   • Format: https://abc123xyz.supabase.co');
    const supabaseUrl = await askQuestion('   Collez votre SUPABASE_URL: ');
    
    console.log('\n🔑 ÉTAPE 2: Clé publique (anon)');
    console.log('   • Allez dans Settings > API');
    console.log('   • Copiez la clé "anon public"');
    const anonKey = await askQuestion('   Collez votre SUPABASE_ANON_KEY: ');
    
    console.log('\n🔐 ÉTAPE 3: Clé service (admin)');
    console.log('   • Dans la même page Settings > API');
    console.log('   • Copiez la clé "service_role" (gardez-la secrète)');
    const serviceKey = await askQuestion('   Collez votre SUPABASE_SERVICE_ROLE_KEY: ');
    
    console.log('\n🗄️ ÉTAPE 4: URL de la base de données');
    console.log('   • Allez dans Settings > Database');
    console.log('   • Section "Connection string"');
    console.log('   • Choisissez "URI" et copiez l\'URL PostgreSQL');
    const databaseUrl = await askQuestion('   Collez votre DATABASE_URL: ');
    
    // Validation basique
    if (!supabaseUrl.includes('supabase.co')) {
      console.log('⚠️ Attention: L\'URL Supabase semble incorrecte');
    }
    
    if (!anonKey.startsWith('eyJ')) {
      console.log('⚠️ Attention: La clé anon semble incorrecte (doit commencer par eyJ)');
    }
    
    if (!serviceKey.startsWith('eyJ')) {
      console.log('⚠️ Attention: La clé service semble incorrecte (doit commencer par eyJ)');
    }
    
    if (!databaseUrl.includes('postgresql://')) {
      console.log('⚠️ Attention: L\'URL de base de données semble incorrecte');
    }
    
    // Création du contenu .env.supabase
    const envContent = `# 🔧 Configuration Supabase pour SMS Pro 3
# Credentials configurés automatiquement

# URL de votre projet Supabase
SUPABASE_URL=${supabaseUrl}

# Clé anonyme/publique
SUPABASE_ANON_KEY=${anonKey}

# Clé service (admin) - ATTENTION: gardez-la secrète
SUPABASE_SERVICE_ROLE_KEY=${serviceKey}

# URL de connexion à la base PostgreSQL
DATABASE_URL=${databaseUrl}

# Variables Orange SMS (déjà configurées)
ORANGE_SMS_CLIENT_ID=MNr0WscAlwy4qQ9dmfMfC4NIAmjZ5D4z
ORANGE_SMS_CLIENT_SECRET=SY4hPdkZ93gvMxqe7FMk6ka6dGUtl8oLYU5ViweMZKL9

# Secrets JWT (seront générés automatiquement)
JWT_SECRET=will-be-generated
NEXTAUTH_SECRET=will-be-generated
NEXTAUTH_URL=http://localhost:3000
`;

    // Sauvegarder le fichier
    fs.writeFileSync('.env.supabase', envContent);
    
    console.log('\n✅ CONFIGURATION RÉUSSIE!');
    console.log('=====================================');
    console.log('✅ Fichier .env.supabase mis à jour');
    console.log('✅ Tous les credentials configurés');
    
    console.log('\n🚀 PROCHAINES ÉTAPES:');
    console.log('1. Exécutez: node setup-supabase.js');
    console.log('2. Puis: node migrate-to-supabase.js');
    
    console.log('\n🧪 Test de connexion disponible:');
    console.log('   node -e "require(\'dotenv\').config({path:\'.env.supabase\'}); console.log(\'URL:\', process.env.SUPABASE_URL);"');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    rl.close();
  }
}

configureSupabase();
