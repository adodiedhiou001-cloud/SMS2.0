#!/usr/bin/env node

/**
 * 🧪 Script de tests automatiques avant déploiement
 * Usage: node pre-deploy-tests.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Tests pré-déploiement SMS Pro 3');
console.log('=====================================\n');

let hasErrors = false;

// ✅ Test 1: Vérification des fichiers critiques
function testCriticalFiles() {
  console.log('📁 Test 1: Fichiers critiques...');
  
  const criticalFiles = [
    'package.json',
    'next.config.js',
    'prisma/schema.prisma',
    'src/app/layout.tsx',
    'src/app/page.tsx'
  ];
  
  criticalFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      console.log(`❌ Fichier manquant: ${file}`);
      hasErrors = true;
    } else {
      console.log(`✅ ${file}`);
    }
  });
  
  console.log('');
}

// ✅ Test 2: Build de l'application
function testBuild() {
  console.log('🔨 Test 2: Build de l\'application...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build réussi\n');
  } catch (error) {
    console.log('❌ Échec du build\n');
    hasErrors = true;
  }
}

// ✅ Test 3: Vérification TypeScript
function testTypeScript() {
  console.log('📝 Test 3: Vérification TypeScript...');
  
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'inherit' });
    console.log('✅ TypeScript OK\n');
  } catch (error) {
    console.log('❌ Erreurs TypeScript détectées\n');
    hasErrors = true;
  }
}

// ✅ Test 4: Vérification des variables d'environnement
function testEnvVars() {
  console.log('🔧 Test 4: Variables d\'environnement...');
  
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'ORANGE_SMS_CLIENT_ID',
    'ORANGE_SMS_CLIENT_SECRET'
  ];
  
  const envExample = fs.readFileSync('.env.production.example', 'utf8');
  
  requiredVars.forEach(varName => {
    if (envExample.includes(varName)) {
      console.log(`✅ ${varName} documenté`);
    } else {
      console.log(`❌ ${varName} manquant dans .env.production.example`);
      hasErrors = true;
    }
  });
  
  console.log('');
}

// ✅ Test 5: Vérification des dépendances
function testDependencies() {
  console.log('📦 Test 5: Dépendances...');
  
  try {
    execSync('npm audit --audit-level=high', { stdio: 'inherit' });
    console.log('✅ Audit des dépendances OK\n');
  } catch (error) {
    console.log('⚠️  Vulnérabilités détectées (vérifiez npm audit)\n');
    // Ne pas bloquer le déploiement pour les vulnérabilités
  }
}

// ✅ Test 6: Test de connexion base de données (si possible)
function testDatabase() {
  console.log('🗄️  Test 6: Schéma de base de données...');
  
  try {
    execSync('npx prisma validate', { stdio: 'inherit' });
    console.log('✅ Schéma Prisma valide\n');
  } catch (error) {
    console.log('❌ Erreur dans le schéma Prisma\n');
    hasErrors = true;
  }
}

// 🏃‍♂️ Exécution des tests
async function runTests() {
  testCriticalFiles();
  testEnvVars();
  testDatabase();
  testTypeScript();
  testBuild();
  testDependencies();
  
  // Résultat final
  console.log('📊 Résultat des tests:');
  console.log('======================');
  
  if (hasErrors) {
    console.log('❌ Des erreurs ont été détectées!');
    console.log('🛑 Déploiement non recommandé');
    console.log('🔧 Corrigez les erreurs avant de déployer\n');
    process.exit(1);
  } else {
    console.log('✅ Tous les tests sont passés!');
    console.log('🚀 Prêt pour le déploiement');
    console.log('📝 Pensez à:');
    console.log('   - Tester en staging d\'abord');
    console.log('   - Vérifier les variables d\'environnement');
    console.log('   - Faire un backup de la base de données\n');
  }
}

// Démarrage
runTests();
