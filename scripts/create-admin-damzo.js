const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminDamzo() {
  try {
    console.log('🔐 Création de l\'utilisateur admin Damzo...');

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { username: 'Damzo' }
    });

    if (existingUser) {
      console.log('⚠️  L\'utilisateur Damzo existe déjà. Mise à jour du mot de passe...');
      
      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash('Coran114', 12);
      
      // Mettre à jour le mot de passe
      await prisma.user.update({
        where: { username: 'Damzo' },
        data: { passwordHash: hashedPassword }
      });
      
      console.log('✅ Mot de passe de Damzo mis à jour avec succès');
      return;
    }

    // Vérifier s'il y a une organisation existante ou en créer une
    let organization = await prisma.organization.findFirst();
    
    if (!organization) {
      console.log('🏢 Création de l\'organisation SMS Pro...');
      organization = await prisma.organization.create({
        data: {
          name: 'SMS Pro SaaS'
        }
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('Coran114', 12);

    // Créer l'utilisateur admin
    const adminUser = await prisma.user.create({
      data: {
        username: 'Damzo',
        email: 'admin@smspro.sn',
        passwordHash: hashedPassword,
        role: 'admin',
        organizationId: organization.id
      }
    });

    console.log('✅ Utilisateur admin Damzo créé avec succès !');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Nom d\'utilisateur: Damzo');
    console.log('🔑 Mot de passe: Coran114');
    console.log('👑 Rôle: admin');
    console.log('🆔 ID:', adminUser.id);

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminDamzo();
