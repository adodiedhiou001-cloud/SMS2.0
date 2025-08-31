# 🚀 Configuration Interactive Supabase
# Ce script configure automatiquement vos credentials Supabase

Write-Host "🔧 CONFIGURATION SUPABASE POUR SMS PRO 3" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Vérifier si on est dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Veuillez exécuter ce script depuis le dossier nextjs-app" -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Récupération de vos credentials Supabase..." -ForegroundColor Yellow
Write-Host "Allez sur https://supabase.com/dashboard et ouvrez votre projet" -ForegroundColor White

# Collecter les informations interactivement
Write-Host "`n🔗 Settings → API :" -ForegroundColor Green
$supabaseUrl = Read-Host "PROJECT URL (https://xxx.supabase.co)"
$anonKey = Read-Host "ANON KEY (eyJhbGci...)"
$serviceKey = Read-Host "SERVICE ROLE KEY (eyJhbGci...)"

Write-Host "`n🗄️ Settings → Database :" -ForegroundColor Green
$databaseUrl = Read-Host "CONNECTION STRING (postgresql://postgres:...)"

# Générer les secrets JWT
Write-Host "`n🔑 Génération des secrets JWT..." -ForegroundColor Yellow
$jwtSecret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
$nextAuthSecret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Créer le fichier .env.local avec les vraies valeurs
$envContent = @"
# 🔧 Configuration Supabase - Générée automatiquement
DATABASE_URL=$databaseUrl
SUPABASE_URL=$supabaseUrl
SUPABASE_ANON_KEY=$anonKey
SUPABASE_SERVICE_ROLE_KEY=$serviceKey

# Orange SMS API
ORANGE_SMS_CLIENT_ID=MNr0WscAlwy4qQ9dmfMfC4NIAmjZ5D4z
ORANGE_SMS_CLIENT_SECRET=SY4hPdkZ93gvMxqe7FMk6ka6dGUtl8oLYU5ViweMZKL9

# Secrets JWT
JWT_SECRET=$jwtSecret
NEXTAUTH_SECRET=$nextAuthSecret
NEXTAUTH_URL=http://localhost:3000
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "`n✅ Fichier .env.local créé avec vos credentials Supabase!" -ForegroundColor Green

# Test de connexion
Write-Host "`n🧪 Test de connexion à Supabase..." -ForegroundColor Yellow

$testScript = @"
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  try {
    console.log('🔄 Test de connexion Supabase...');
    
    const supabase = createClient('$supabaseUrl', '$anonKey');
    
    // Test simple
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    
    if (error && error.code !== '42P01') { // 42P01 = table doesn't exist (normal)
      throw error;
    }
    
    console.log('✅ Connexion Supabase réussie!');
    console.log('📊 Projet:', '$supabaseUrl'.split('//')[1].split('.')[0]);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion Supabase:', error.message);
    return false;
  }
}

testSupabaseConnection().then(success => {
  if (success) {
    console.log('\\n🎯 Configuration terminée! Prêt pour la migration.');
  } else {
    console.log('\\n⚠️ Vérifiez vos credentials Supabase.');
  }
});
"@

$testScript | Out-File -FilePath "temp-test-supabase.js" -Encoding UTF8

# Installer le client Supabase si nécessaire
try {
    npm list @supabase/supabase-js 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "📦 Installation du client Supabase..." -ForegroundColor Yellow
        npm install @supabase/supabase-js
    }
} catch {
    Write-Host "📦 Installation du client Supabase..." -ForegroundColor Yellow
    npm install @supabase/supabase-js
}

node temp-test-supabase.js
Remove-Item "temp-test-supabase.js" -ErrorAction SilentlyContinue

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n🚀 CONFIGURATION REUSSIE!" -ForegroundColor Green
    Write-Host "Prochaine etape : executer la migration" -ForegroundColor White
    Write-Host "Commande : .\migrate-to-supabase.ps1" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Probleme de configuration" -ForegroundColor Red
    Write-Host "Verifiez vos credentials Supabase" -ForegroundColor Yellow
}
