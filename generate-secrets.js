// 🔑 Générateur de clés secrètes pour Windows
// Usage: node generate-secrets.js

const crypto = require('crypto');

console.log('🔑 Génération des clés secrètes pour SMS Pro 3\n');

// Générer des clés sécurisées
const nextauthSecret = crypto.randomBytes(32).toString('base64');
const jwtSecret = crypto.randomBytes(32).toString('base64');

console.log('📋 Variables d\'environnement à configurer sur Vercel :');
console.log('=====================================================\n');

console.log('1. DATABASE_URL');
console.log('   → Copiez l\'URL de votre base Supabase/Neon\n');

console.log('2. NEXTAUTH_SECRET');
console.log(`   → ${nextauthSecret}\n`);

console.log('3. NEXTAUTH_URL'); 
console.log('   → https://votre-site.vercel.app (sera généré automatiquement)\n');

console.log('4. ORANGE_SMS_CLIENT_ID');
console.log('   → MNr0WscAlwy4qQ9dmfMfC4NIAmjZ5D4z\n');

console.log('5. ORANGE_SMS_CLIENT_SECRET');
console.log('   → SY4hPdkZ93gvMxqe7FMk6ka6dGUtl8oLYU5ViweMZKL9\n');

console.log('6. JWT_SECRET');
console.log(`   → ${jwtSecret}\n`);

console.log('✅ Clés générées avec succès !');
console.log('📝 Copiez ces valeurs dans Vercel > Settings > Environment Variables');
