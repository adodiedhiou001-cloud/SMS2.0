const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetPassword() {
  try {
    console.log('🔧 Réinitialisation du mot de passe pour "admin"...');

    // Nouveau mot de passe simple
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe de l'utilisateur admin
    const user = await prisma.user.update({
      where: {
        username: 'admin'
      },
      data: {
        passwordHash: hashedPassword
      }
    });

    console.log('✅ Mot de passe réinitialisé avec succès !');
    console.log(`   - Nom d'utilisateur: admin`);
    console.log(`   - Nouveau mot de passe: ${newPassword}`);
    console.log('\n🌐 Vous pouvez maintenant vous connecter sur: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
