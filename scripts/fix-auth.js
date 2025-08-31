const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixAuthentication() {
  try {
    console.log('🔧 Correction des problèmes d\'authentification...');
    
    // Créer un nouveau hash pour le mot de passe
    const password = 'admin123';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log('🔐 Nouveau hash généré:', hashedPassword.substring(0, 20) + '...');
    
    // Chercher l'utilisateur existant
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: 'admin' },
          { email: 'admin@test.com' }
        ]
      },
      include: {
        organization: true
      }
    });
    
    if (user) {
      // Mettre à jour l'utilisateur existant
      console.log('👤 Utilisateur existant trouvé, mise à jour...');
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          username: 'admin',
          email: 'admin@test.com',
          passwordHash: hashedPassword,
          role: 'ADMIN'
        },
        include: {
          organization: true
        }
      });
    } else {
      // Créer le nouvel utilisateur
      console.log('👤 Création d\'un nouvel utilisateur...');
      user = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@test.com',
          passwordHash: hashedPassword,
          role: 'ADMIN',
          organization: {
            create: {
              name: 'SMS Pro Organization'
            }
          }
        },
        include: {
          organization: true
        }
      });
    }
    
    console.log('✅ Utilisateur créé avec succès:', user.username);
    console.log('📧 Email:', user.email);
    console.log('🏢 Organisation:', user.organization.name);
    
    // Tester la vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    console.log('🔓 Test de vérification du mot de passe:', isPasswordValid ? '✅ VALIDE' : '❌ INVALIDE');
    
    if (!isPasswordValid) {
      throw new Error('La vérification du mot de passe a échoué!');
    }
    
    console.log('\n🎉 Authentification corrigée avec succès!');
    console.log('📝 Credentials de connexion:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAuthentication();
