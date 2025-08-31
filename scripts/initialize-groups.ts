const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeDefaultGroups() {
  try {
    console.log('🔍 Vérification des groupes existants...');

    // Récupérer l'utilisateur admin
    const user = await prisma.user.findFirst({
      where: { username: 'admin' },
      include: { organization: true }
    });

    if (!user) {
      console.error('❌ Utilisateur admin introuvable.');
      return;
    }

    const organizationId = user.organizationId;

    // Vérifier si des groupes existent déjà
    const existingGroups = await prisma.contactGroup.findMany({
      where: { organizationId }
    });

    if (existingGroups.length > 0) {
      console.log(`✅ ${existingGroups.length} groupes déjà existants :`, 
        existingGroups.map(g => g.name));
      return;
    }

    console.log('📝 Création des groupes par défaut...');

    // Groupes par défaut à créer
    const defaultGroups = [
      {
        name: 'Clients VIP',
        description: 'Clients privilégiés et fidèles',
        color: '#10B981',
        icon: 'Star'
      },
      {
        name: 'Prospects',
        description: 'Contacts potentiels à convertir',
        color: '#F59E0B',
        icon: 'Target'
      },
      {
        name: 'Clients Premium',
        description: 'Clients avec abonnement premium',
        color: '#8B5CF6',
        icon: 'Crown'
      },
      {
        name: 'Équipe',
        description: 'Membres de l\'équipe interne',
        color: '#3B82F6',
        icon: 'Users'
      },
      {
        name: 'Partenaires',
        description: 'Partenaires commerciaux et fournisseurs',
        color: '#EF4444',
        icon: 'Handshake'
      },
      {
        name: 'Leads Marketing',
        description: 'Contacts issus des campagnes marketing',
        color: '#06B6D4',
        icon: 'Megaphone'
      }
    ];

    // Créer les groupes
    const createdGroups = await Promise.all(
      defaultGroups.map(group =>
        prisma.contactGroup.create({
          data: {
            ...group,
            organizationId
          }
        })
      )
    );

    console.log('✅ Groupes créés avec succès :');
    createdGroups.forEach(group => {
      console.log(`  • ${group.name} (${group.description})`);
    });

    // Créer des contacts de démonstration pour chaque groupe
    console.log('\n👥 Création de contacts de démonstration...');

    const demoContacts = [
      // Clients VIP
      {
        firstName: 'Jean-Pierre',
        lastName: 'Dubois',
        phone: '+33123456789',
        email: 'jp.dubois@email.com',
        company: 'Dubois Enterprises',
        groupId: createdGroups[0].id,
        notes: 'Client VIP depuis 5 ans'
      },
      {
        firstName: 'Marie-Claire',
        lastName: 'Martin',
        phone: '+33234567890',
        email: 'mc.martin@email.com',
        company: 'Martin Industries',
        groupId: createdGroups[0].id,
        notes: 'Commandes importantes chaque mois'
      },
      
      // Prospects
      {
        firstName: 'Antoine',
        lastName: 'Bernard',
        phone: '+33345678901',
        email: 'a.bernard@prospect.com',
        company: 'Prospect Solutions',
        groupId: createdGroups[1].id,
        notes: 'Intéressé par nos services premium'
      },
      {
        firstName: 'Sophie',
        lastName: 'Leroy',
        phone: '+33456789012',
        email: 's.leroy@startup.com',
        company: 'StartupTech',
        groupId: createdGroups[1].id,
        notes: 'Demande de devis en cours'
      },
      
      // Clients Premium
      {
        firstName: 'Thomas',
        lastName: 'Moreau',
        phone: '+33567890123',
        email: 't.moreau@premium.com',
        company: 'Premium Corp',
        groupId: createdGroups[2].id,
        notes: 'Abonné premium actif'
      },
      
      // Équipe
      {
        firstName: 'Laura',
        lastName: 'Petit',
        phone: '+33678901234',
        email: 'l.petit@smspro.com',
        company: 'SMS Pro',
        groupId: createdGroups[3].id,
        notes: 'Responsable marketing'
      },
      
      // Partenaires
      {
        firstName: 'Nicolas',
        lastName: 'Roux',
        phone: '+33789012345',
        email: 'n.roux@partner.com',
        company: 'Partner Solutions',
        groupId: createdGroups[4].id,
        notes: 'Partenaire technologique'
      },
      
      // Leads Marketing
      {
        firstName: 'Camille',
        lastName: 'Blanc',
        phone: '+33890123456',
        email: 'c.blanc@lead.com',
        company: 'Lead Generation Co',
        groupId: createdGroups[5].id,
        notes: 'Contact via campagne Google Ads'
      }
    ];

    const createdContacts = await Promise.all(
      demoContacts.map(contact =>
        prisma.contact.create({
          data: {
            ...contact,
            organizationId
          }
        })
      )
    );

    console.log(`✅ ${createdContacts.length} contacts de démonstration créés`);

    // Résumé final
    console.log('\n🎉 Initialisation terminée avec succès !');
    console.log('📊 Résumé :');
    console.log(`  • ${createdGroups.length} groupes de contacts créés`);
    console.log(`  • ${createdContacts.length} contacts de démonstration ajoutés`);
    
    // Afficher la répartition par groupe
    const groupCounts = await Promise.all(
      createdGroups.map(async (group) => {
        const count = await prisma.contact.count({
          where: { groupId: group.id }
        });
        return { name: group.name, count };
      })
    );

    console.log('\n📋 Répartition par groupe :');
    groupCounts.forEach(({ name, count }) => {
      console.log(`  • ${name}: ${count} contact(s)`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeDefaultGroups();
