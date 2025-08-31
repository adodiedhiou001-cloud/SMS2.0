const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

console.log('🚀 MIGRATION VERS SUPABASE');
console.log('================================\n');

(async () => {
  let sqlitePrisma, supabasePrisma;
  
  try {
    // 1. Configuration SQLite (source)
    console.log('🔧 Connexion à SQLite...');
    sqlitePrisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./prisma/dev.db'
        }
      }
    });

    // 2. Configuration Supabase (destination)
    console.log('🔧 Connexion à Supabase...');
    require('dotenv').config({path: '.env.supabase'});
    supabasePrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    // 3. Test de connexion Supabase
    console.log('🧪 Test de connexion Supabase...');
    await supabasePrisma.$queryRaw`SELECT version()`;
    console.log('✅ Connexion Supabase réussie!\n');

    // 4. Export des données SQLite
    console.log('📤 Export des données SQLite...');
    
    const organizations = await sqlitePrisma.organization.findMany({
      include: {
        users: true,
        contacts: true,
        contactGroups: true,
        campaigns: true,
        templates: true,
        apiKeys: true,
        auditLogs: true
      }
    });

    const contacts = await sqlitePrisma.contact.findMany();
    const campaigns = await sqlitePrisma.campaign.findMany();
    const messages = await sqlitePrisma.message.findMany();
    const templates = await sqlitePrisma.template.findMany();

    console.log(`📊 Données à migrer:`);
    console.log(`   • ${organizations.length} organisations`);
    console.log(`   • ${organizations.reduce((acc, org) => acc + org.users.length, 0)} utilisateurs`);
    console.log(`   • ${contacts.length} contacts`);
    console.log(`   • ${campaigns.length} campagnes`);
    console.log(`   • ${messages.length} messages`);
    console.log(`   • ${templates.length} templates\n`);

    // 5. Migration vers Supabase
    console.log('📥 Import vers Supabase...');

    for (const org of organizations) {
      console.log(`🏢 Migration organisation: ${org.name}`);
      
      // Créer l'organisation
      const newOrg = await supabasePrisma.organization.upsert({
        where: { id: org.id },
        update: {},
        create: {
          id: org.id,
          name: org.name,
          createdAt: org.createdAt,
          updatedAt: org.updatedAt
        }
      });

      // Migrer les utilisateurs
      for (const user of org.users) {
        console.log(`👤 Migration utilisateur: ${user.username}`);
        await supabasePrisma.user.upsert({
          where: { id: user.id },
          update: {},
          create: {
            id: user.id,
            username: user.username,
            email: user.email,
            passwordHash: user.passwordHash,
            role: user.role,
            organizationId: user.organizationId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        });
      }

      // Migrer les groupes de contacts
      for (const group of org.contactGroups) {
        console.log(`📁 Migration groupe: ${group.name}`);
        await supabasePrisma.contactGroup.upsert({
          where: { id: group.id },
          update: {},
          create: {
            id: group.id,
            name: group.name,
            description: group.description,
            color: group.color,
            icon: group.icon,
            organizationId: group.organizationId,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt
          }
        });
      }

      // Migrer les contacts
      for (const contact of org.contacts) {
        console.log(`📞 Migration contact: ${contact.firstName} ${contact.lastName}`);
        await supabasePrisma.contact.upsert({
          where: { id: contact.id },
          update: {},
          create: {
            id: contact.id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            phone: contact.phone,
            email: contact.email,
            company: contact.company,
            address: contact.address,
            dateOfBirth: contact.dateOfBirth,
            notes: contact.notes,
            tags: contact.tags,
            organizationId: contact.organizationId,
            groupId: contact.groupId,
            createdAt: contact.createdAt,
            updatedAt: contact.updatedAt
          }
        });
      }

      // Migrer les campagnes
      for (const campaign of org.campaigns) {
        console.log(`📢 Migration campagne: ${campaign.name}`);
        await supabasePrisma.campaign.upsert({
          where: { id: campaign.id },
          update: {},
          create: {
            id: campaign.id,
            name: campaign.name,
            message: campaign.message,
            status: campaign.status,
            scheduledAt: campaign.scheduledAt,
            sentAt: campaign.sentAt,
            organizationId: campaign.organizationId,
            createdBy: campaign.createdBy,
            createdAt: campaign.createdAt,
            updatedAt: campaign.updatedAt
          }
        });
      }

      // Migrer les templates
      for (const template of org.templates) {
        console.log(`📝 Migration template: ${template.name}`);
        await supabasePrisma.template.upsert({
          where: { id: template.id },
          update: {},
          create: {
            id: template.id,
            name: template.name,
            content: template.content,
            category: template.category,
            channel: template.channel,
            isActive: template.isActive,
            isSystem: template.isSystem,
            tags: template.tags,
            variables: template.variables,
            promoCode: template.promoCode,
            promoValue: template.promoValue,
            promoExpiry: template.promoExpiry,
            organizationId: template.organizationId,
            createdBy: template.createdBy,
            createdAt: template.createdAt,
            updatedAt: template.updatedAt
          }
        });
      }

      // Migrer les API keys
      for (const apiKey of org.apiKeys) {
        console.log(`🔑 Migration API key: ${apiKey.name}`);
        await supabasePrisma.apiKey.upsert({
          where: { id: apiKey.id },
          update: {},
          create: {
            id: apiKey.id,
            name: apiKey.name,
            keyHash: apiKey.keyHash,
            permissions: apiKey.permissions,
            organizationId: apiKey.organizationId,
            isActive: apiKey.isActive,
            lastUsedAt: apiKey.lastUsedAt,
            createdAt: apiKey.createdAt,
            updatedAt: apiKey.updatedAt
          }
        });
      }

      // Migrer les logs d'audit
      for (const log of org.auditLogs) {
        console.log(`📋 Migration audit log: ${log.action}`);
        await supabasePrisma.auditLog.upsert({
          where: { id: log.id },
          update: {},
          create: {
            id: log.id,
            action: log.action,
            resource: log.resource,
            resourceId: log.resourceId,
            userId: log.userId,
            organizationId: log.organizationId,
            metadata: log.metadata,
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            createdAt: log.createdAt
          }
        });
      }
    }

    // Migrer les messages
    console.log('📨 Migration des messages...');
    for (const message of messages) {
      await supabasePrisma.message.upsert({
        where: { id: message.id },
        update: {},
        create: {
          id: message.id,
          content: message.content,
          status: message.status,
          sentAt: message.sentAt,
          contactId: message.contactId,
          campaignId: message.campaignId,
          phoneNumber: message.phoneNumber,
          provider: message.provider,
          externalId: message.externalId,
          metadata: message.metadata,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt
        }
      });
    }

    // 6. Vérification finale
    console.log('\n🔍 Vérification de la migration...');
    
    const supabaseOrgs = await supabasePrisma.organization.count();
    const supabaseUsers = await supabasePrisma.user.count();
    const supabaseContacts = await supabasePrisma.contact.count();
    const supabaseCampaigns = await supabasePrisma.campaign.count();
    const supabaseMessages = await supabasePrisma.message.count();

    console.log(`✅ Organisations migrées: ${supabaseOrgs}`);
    console.log(`✅ Utilisateurs migrés: ${supabaseUsers}`);
    console.log(`✅ Contacts migrés: ${supabaseContacts}`);
    console.log(`✅ Campagnes migrées: ${supabaseCampaigns}`);
    console.log(`✅ Messages migrés: ${supabaseMessages}`);

    console.log('\n🎉 MIGRATION TERMINÉE AVEC SUCCÈS!');
    console.log('=====================================');
    console.log('Votre base de données SQLite a été migrée vers Supabase.');
    console.log('Vous pouvez maintenant déployer sur Vercel!');
    
    // 7. Instructions de déploiement
    console.log('\n📋 PROCHAINES ÉTAPES:');
    console.log('1. Connectez votre repo GitHub à Vercel');
    console.log('2. Ajoutez les variables d\'environnement dans Vercel:');
    console.log('   • SUPABASE_URL');
    console.log('   • SUPABASE_ANON_KEY');
    console.log('   • SUPABASE_SERVICE_ROLE_KEY');
    console.log('   • DATABASE_URL');
    console.log('3. Déployez votre application!');

  } catch (error) {
    console.error('❌ ERREUR DE MIGRATION:', error.message);
    console.error(error);
  } finally {
    if (sqlitePrisma) await sqlitePrisma.$disconnect();
    if (supabasePrisma) await supabasePrisma.$disconnect();
  }
})();
