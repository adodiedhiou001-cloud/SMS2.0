const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

console.log('🚀 MIGRATION VERS SUPABASE');
console.log('================================\n');

async function migrateToSupabase() {
  let sqlitePrisma, postgresqlPrisma;
  
  try {
    // 1. Vérifier que les credentials Supabase sont configurés
    console.log('🔍 Vérification de la configuration...');
    
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('your-project-id')) {
      console.error('❌ DATABASE_URL non configuré dans .env.supabase');
      console.log('💡 Configurez d\'abord vos credentials Supabase dans .env.supabase');
      process.exit(1);
    }
    
    // 2. Initialiser les clients Prisma
    console.log('🔧 Initialisation des connexions...');
    
    // Client SQLite (base actuelle)
    sqlitePrisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./prisma/dev.db'
        }
      }
    });
    
    // Client PostgreSQL (Supabase)
    postgresqlPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
    
    // 3. Test de connexion Supabase
    console.log('🧪 Test de connexion Supabase...');
    await postgresqlPrisma.$queryRaw`SELECT version()`;
    console.log('✅ Connexion Supabase réussie!\n');
    
    // 4. Export des données SQLite
    console.log('📤 Export des données SQLite...');
    
    const organizations = await sqlitePrisma.organization.findMany({
      include: {
        users: true,
        campaigns: {
          include: {
            recipients: true
          }
        },
        contacts: true
      }
    });
    
    console.log(`📊 Données à migrer:`);
    console.log(`   - ${organizations.length} organisations`);
    
    let totalUsers = 0, totalCampaigns = 0, totalContacts = 0, totalRecipients = 0;
    
    organizations.forEach(org => {
      totalUsers += org.users.length;
      totalCampaigns += org.campaigns.length;
      totalContacts += org.contacts.length;
      org.campaigns.forEach(campaign => {
        totalRecipients += campaign.recipients.length;
      });
    });
    
    console.log(`   - ${totalUsers} utilisateurs`);
    console.log(`   - ${totalCampaigns} campagnes`);
    console.log(`   - ${totalContacts} contacts`);
    console.log(`   - ${totalRecipients} destinataires\n`);
    
    // 5. Migration vers Supabase
    console.log('⬆️ Migration vers Supabase...');
    
    let migrated = {
      organizations: 0,
      users: 0,
      campaigns: 0,
      contacts: 0,
      recipients: 0
    };
    
    for (const org of organizations) {
      try {
        console.log(`🔄 Migration organisation: ${org.name}`);
        
        // Créer l'organisation
        const newOrg = await postgresqlPrisma.organization.upsert({
          where: { id: org.id },
          update: {},
          create: {
            id: org.id,
            name: org.name,
            createdAt: org.createdAt,
            updatedAt: org.updatedAt
          }
        });
        migrated.organizations++;
        
        // Migrer les utilisateurs
        for (const user of org.users) {
          await postgresqlPrisma.user.upsert({
            where: { id: user.id },
            update: {},
            create: {
              id: user.id,
              username: user.username,
              password: user.password,
              role: user.role,
              organizationId: org.id,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt
            }
          });
          migrated.users++;
        }
        
        // Migrer les contacts
        for (const contact of org.contacts) {
          await postgresqlPrisma.contact.upsert({
            where: { id: contact.id },
            update: {},
            create: {
              id: contact.id,
              name: contact.name,
              phone: contact.phone,
              organizationId: org.id,
              createdAt: contact.createdAt,
              updatedAt: contact.updatedAt
            }
          });
          migrated.contacts++;
        }
        
        // Migrer les campagnes
        for (const campaign of org.campaigns) {
          const newCampaign = await postgresqlPrisma.campaign.upsert({
            where: { id: campaign.id },
            update: {},
            create: {
              id: campaign.id,
              name: campaign.name,
              message: campaign.message,
              status: campaign.status,
              scheduledAt: campaign.scheduledAt,
              sentAt: campaign.sentAt,
              organizationId: org.id,
              createdAt: campaign.createdAt,
              updatedAt: campaign.updatedAt
            }
          });
          migrated.campaigns++;
          
          // Migrer les destinataires
          for (const recipient of campaign.recipients) {
            await postgresqlPrisma.campaignRecipient.upsert({
              where: { id: recipient.id },
              update: {},
              create: {
                id: recipient.id,
                phone: recipient.phone,
                status: recipient.status,
                sentAt: recipient.sentAt,
                campaignId: campaign.id,
                createdAt: recipient.createdAt,
                updatedAt: recipient.updatedAt
              }
            });
            migrated.recipients++;
          }
        }
        
        console.log(`✅ Organisation "${org.name}" migrée`);
        
      } catch (error) {
        console.error(`❌ Erreur migration organisation ${org.name}:`, error.message);
      }
    }
    
    // 6. Vérification post-migration
    console.log('\n🧪 Vérification post-migration...');
    
    const postgresqlOrgs = await postgresqlPrisma.organization.count();
    const postgresqlUsers = await postgresqlPrisma.user.count();
    const postgresqlCampaigns = await postgresqlPrisma.campaign.count();
    const postgresqlContacts = await postgresqlPrisma.contact.count();
    
    console.log('📊 Résultats de migration:');
    console.log(`   ✅ Organisations: ${migrated.organizations}/${organizations.length}`);
    console.log(`   ✅ Utilisateurs: ${migrated.users}/${totalUsers}`);
    console.log(`   ✅ Campagnes: ${migrated.campaigns}/${totalCampaigns}`);
    console.log(`   ✅ Contacts: ${migrated.contacts}/${totalContacts}`);
    console.log(`   ✅ Destinataires: ${migrated.recipients}/${totalRecipients}`);
    
    console.log('\n📈 Données dans Supabase:');
    console.log(`   - ${postgresqlOrgs} organisations`);
    console.log(`   - ${postgresqlUsers} utilisateurs`);
    console.log(`   - ${postgresqlCampaigns} campagnes`);
    console.log(`   - ${postgresqlContacts} contacts`);
    
    if (postgresqlOrgs === organizations.length && 
        postgresqlUsers === totalUsers && 
        postgresqlCampaigns === totalCampaigns && 
        postgresqlContacts === totalContacts) {
      console.log('\n🎉 MIGRATION RÉUSSIE!');
      console.log('✅ Toutes les données ont été migrées avec succès');
      console.log('\n🔄 Prochaines étapes:');
      console.log('   1. Mettre à jour .env.local avec DATABASE_URL Supabase');
      console.log('   2. Tester l\'application avec Supabase');
      console.log('   3. Configurer les variables Vercel');
      console.log('   4. Déployer en production');
    } else {
      console.log('\n⚠️ Migration incomplète - Vérifiez les erreurs ci-dessus');
    }
    
  } catch (error) {
    console.error('\n❌ ERREUR DE MIGRATION:', error.message);
    
    if (error.message.includes('connect')) {
      console.log('\n💡 Solutions possibles:');
      console.log('   - Vérifiez votre DATABASE_URL dans .env.supabase');
      console.log('   - Assurez-vous que le projet Supabase est actif');
      console.log('   - Vérifiez votre connexion internet');
    }
    
  } finally {
    // Fermer les connexions
    if (sqlitePrisma) await sqlitePrisma.$disconnect();
    if (postgresqlPrisma) await postgresqlPrisma.$disconnect();
  }
}

// Charger les variables d'environnement Supabase
require('dotenv').config({ path: '.env.supabase' });

migrateToSupabase();
