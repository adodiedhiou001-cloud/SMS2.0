const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

console.log('📦 EXPORT DES DONNÉES SQLITE VERS JSON');
console.log('=====================================\n');

// Utiliser la base SQLite avec le schéma original
const sqlite = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');

if (!fs.existsSync(dbPath)) {
  console.error('❌ Fichier SQLite introuvable:', dbPath);
  process.exit(1);
}

const db = new sqlite.Database(dbPath);

// Fonction pour exécuter une requête SQL
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

(async () => {
  try {
    console.log('🔍 Lecture des données SQLite...');

    // Export de toutes les tables
    const organizations = await query('SELECT * FROM organizations');
    const users = await query('SELECT * FROM users');
    const contactGroups = await query('SELECT * FROM contact_groups');
    const contacts = await query('SELECT * FROM contacts');
    const campaigns = await query('SELECT * FROM campaigns');
    const messages = await query('SELECT * FROM messages');
    const templates = await query('SELECT * FROM templates');
    const apiKeys = await query('SELECT * FROM api_keys');
    const auditLogs = await query('SELECT * FROM audit_logs');

    console.log(`📊 Données exportées:`);
    console.log(`   • ${organizations.length} organisations`);
    console.log(`   • ${users.length} utilisateurs`);
    console.log(`   • ${contactGroups.length} groupes de contacts`);
    console.log(`   • ${contacts.length} contacts`);
    console.log(`   • ${campaigns.length} campagnes`);
    console.log(`   • ${messages.length} messages`);
    console.log(`   • ${templates.length} templates`);
    console.log(`   • ${apiKeys.length} clés API`);
    console.log(`   • ${auditLogs.length} logs d'audit\n`);

    // Sauvegarder en JSON
    const exportData = {
      organizations,
      users,
      contactGroups,
      contacts,
      campaigns,
      messages,
      templates,
      apiKeys,
      auditLogs,
      exportDate: new Date().toISOString()
    };

    fs.writeFileSync('sqlite-export.json', JSON.stringify(exportData, null, 2));
    console.log('✅ Données exportées vers sqlite-export.json');

    db.close();

    // Maintenant import vers Supabase
    console.log('\n📥 IMPORT VERS SUPABASE');
    console.log('========================\n');

    require('dotenv').config({path: '.env.supabase'});
    
    const supabase = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    console.log('🧪 Test connexion Supabase...');
    await supabase.$queryRaw`SELECT version()`;
    console.log('✅ Connexion Supabase réussie!\n');

    // Import organisations
    console.log('🏢 Import des organisations...');
    for (const org of organizations) {
      await supabase.organization.upsert({
        where: { id: org.id },
        update: {},
        create: {
          id: org.id,
          name: org.name,
          createdAt: new Date(org.createdAt),
          updatedAt: new Date(org.updatedAt)
        }
      });
      console.log(`   ✅ ${org.name}`);
    }

    // Import utilisateurs
    console.log('👤 Import des utilisateurs...');
    for (const user of users) {
      await supabase.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          username: user.username,
          email: user.email,
          passwordHash: user.passwordHash,
          role: user.role,
          organizationId: user.organizationId,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }
      });
      console.log(`   ✅ ${user.username}`);
    }

    // Import groupes de contacts
    console.log('📁 Import des groupes de contacts...');
    for (const group of contactGroups) {
      await supabase.contactGroup.upsert({
        where: { id: group.id },
        update: {},
        create: {
          id: group.id,
          name: group.name,
          description: group.description,
          color: group.color,
          icon: group.icon,
          organizationId: group.organizationId,
          createdAt: new Date(group.createdAt),
          updatedAt: new Date(group.updatedAt)
        }
      });
      console.log(`   ✅ ${group.name}`);
    }

    // Import contacts
    console.log('📞 Import des contacts...');
    for (const contact of contacts) {
      await supabase.contact.upsert({
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
          dateOfBirth: contact.dateOfBirth ? new Date(contact.dateOfBirth) : null,
          notes: contact.notes,
          tags: contact.tags,
          organizationId: contact.organizationId,
          groupId: contact.groupId,
          createdAt: new Date(contact.createdAt),
          updatedAt: new Date(contact.updatedAt)
        }
      });
      console.log(`   ✅ ${contact.firstName} ${contact.lastName}`);
    }

    // Import campagnes
    console.log('📢 Import des campagnes...');
    for (const campaign of campaigns) {
      await supabase.campaign.upsert({
        where: { id: campaign.id },
        update: {},
        create: {
          id: campaign.id,
          name: campaign.name,
          message: campaign.message,
          status: campaign.status,
          scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt) : null,
          sentAt: campaign.sentAt ? new Date(campaign.sentAt) : null,
          organizationId: campaign.organizationId,
          createdBy: campaign.createdBy,
          createdAt: new Date(campaign.createdAt),
          updatedAt: new Date(campaign.updatedAt)
        }
      });
      console.log(`   ✅ ${campaign.name}`);
    }

    // Import messages
    console.log('📨 Import des messages...');
    for (const message of messages) {
      await supabase.message.upsert({
        where: { id: message.id },
        update: {},
        create: {
          id: message.id,
          content: message.content,
          status: message.status,
          sentAt: message.sentAt ? new Date(message.sentAt) : null,
          contactId: message.contactId,
          campaignId: message.campaignId,
          phoneNumber: message.phoneNumber,
          provider: message.provider,
          externalId: message.externalId,
          metadata: message.metadata,
          createdAt: new Date(message.createdAt),
          updatedAt: new Date(message.updatedAt)
        }
      });
      console.log(`   ✅ Message ${message.id}`);
    }

    // Import templates
    console.log('📝 Import des templates...');
    for (const template of templates) {
      await supabase.template.upsert({
        where: { id: template.id },
        update: {},
        create: {
          id: template.id,
          name: template.name,
          content: template.content,
          category: template.category,
          channel: template.channel,
          isActive: Boolean(template.isActive),
          isSystem: Boolean(template.isSystem),
          tags: template.tags,
          variables: template.variables,
          promoCode: template.promoCode,
          promoValue: template.promoValue,
          promoExpiry: template.promoExpiry ? new Date(template.promoExpiry) : null,
          organizationId: template.organizationId,
          createdBy: template.createdBy,
          createdAt: new Date(template.createdAt),
          updatedAt: new Date(template.updatedAt)
        }
      });
      console.log(`   ✅ ${template.name}`);
    }

    // Import API keys
    console.log('🔑 Import des clés API...');
    for (const apiKey of apiKeys) {
      await supabase.apiKey.upsert({
        where: { id: apiKey.id },
        update: {},
        create: {
          id: apiKey.id,
          name: apiKey.name,
          keyHash: apiKey.keyHash,
          permissions: apiKey.permissions,
          organizationId: apiKey.organizationId,
          isActive: Boolean(apiKey.isActive),
          lastUsedAt: apiKey.lastUsedAt ? new Date(apiKey.lastUsedAt) : null,
          createdAt: new Date(apiKey.createdAt),
          updatedAt: new Date(apiKey.updatedAt)
        }
      });
      console.log(`   ✅ ${apiKey.name}`);
    }

    // Import audit logs
    console.log('📋 Import des logs d\'audit...');
    for (const log of auditLogs) {
      await supabase.auditLog.upsert({
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
          createdAt: new Date(log.createdAt)
        }
      });
      console.log(`   ✅ ${log.action}`);
    }

    // Vérification finale
    console.log('\n🔍 Vérification finale...');
    const finalCounts = {
      organizations: await supabase.organization.count(),
      users: await supabase.user.count(),
      contactGroups: await supabase.contactGroup.count(),
      contacts: await supabase.contact.count(),
      campaigns: await supabase.campaign.count(),
      messages: await supabase.message.count(),
      templates: await supabase.template.count(),
      apiKeys: await supabase.apiKey.count(),
      auditLogs: await supabase.auditLog.count()
    };

    console.log(`✅ Vérification terminée:`);
    console.log(`   • ${finalCounts.organizations} organisations`);
    console.log(`   • ${finalCounts.users} utilisateurs`);
    console.log(`   • ${finalCounts.contactGroups} groupes de contacts`);
    console.log(`   • ${finalCounts.contacts} contacts`);
    console.log(`   • ${finalCounts.campaigns} campagnes`);
    console.log(`   • ${finalCounts.messages} messages`);
    console.log(`   • ${finalCounts.templates} templates`);
    console.log(`   • ${finalCounts.apiKeys} clés API`);
    console.log(`   • ${finalCounts.auditLogs} logs d'audit`);

    console.log('\n🎉 MIGRATION TERMINÉE AVEC SUCCÈS!');
    console.log('=====================================');
    console.log('Votre application SMS Pro 3 est maintenant prête pour Supabase!');
    console.log('\n📋 PROCHAINES ÉTAPES POUR LE DÉPLOIEMENT:');
    console.log('1. Poussez votre code sur GitHub');
    console.log('2. Connectez votre repo à Vercel');
    console.log('3. Ajoutez ces variables d\'environnement dans Vercel:');
    console.log('   • DATABASE_URL=' + process.env.DATABASE_URL);
    console.log('   • SUPABASE_URL=' + process.env.SUPABASE_URL);
    console.log('   • SUPABASE_ANON_KEY=' + process.env.SUPABASE_ANON_KEY);
    console.log('   • SUPABASE_SERVICE_ROLE_KEY=' + process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('4. Déployez votre application!');

    await supabase.$disconnect();

  } catch (error) {
    console.error('❌ ERREUR:', error);
  }
})();
