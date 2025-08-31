const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function initContactGroups() {
  try {
    console.log('🚀 Initialisation des groupes de contacts...');

    // Récupérer toutes les organisations
    const organizations = await prisma.organization.findMany();
    
    if (organizations.length === 0) {
      console.log('❌ Aucune organisation trouvée. Veuillez d\'abord créer une organisation.');
      return;
    }

    // Groupes de contacts par défaut
    const defaultGroups = [
      {
        name: 'Clients VIP',
        description: 'Clients fidèles et grands acheteurs',
        color: '#8B5CF6',
        icon: 'Star'
      },
      {
        name: 'Nouveaux clients',
        description: 'Clients récemment inscrits',
        color: '#10B981',
        icon: 'UserPlus'
      },
      {
        name: 'Prospects',
        description: 'Contacts intéressés mais pas encore clients',
        color: '#F59E0B',
        icon: 'Eye'
      },
      {
        name: 'Anniversaires du mois',
        description: 'Contacts ayant leur anniversaire ce mois-ci',
        color: '#EF4444',
        icon: 'Gift'
      },
      {
        name: 'Partenaires',
        description: 'Partenaires commerciaux et fournisseurs',
        color: '#3B82F6',
        icon: 'Handshake'
      },
      {
        name: 'Équipe',
        description: 'Membres de l\'équipe et employés',
        color: '#6366F1',
        icon: 'Users'
      }
    ];

    let totalCreated = 0;

    for (const org of organizations) {
      console.log(`\n📁 Traitement de l'organisation: ${org.name}`);
      
      for (const groupData of defaultGroups) {
        // Vérifier si le groupe existe déjà
        const existingGroup = await prisma.contactGroup.findFirst({
          where: {
            name: groupData.name,
            organizationId: org.id
          }
        });

        if (existingGroup) {
          console.log(`   ⏭️  Groupe "${groupData.name}" existe déjà`);
          continue;
        }

        // Créer le groupe
        await prisma.contactGroup.create({
          data: {
            ...groupData,
            organizationId: org.id
          }
        });

        console.log(`   ✅ Groupe "${groupData.name}" créé`);
        totalCreated++;
      }
    }

    console.log(`\n🎉 Initialisation terminée !`);
    console.log(`📊 Résumé:`);
    console.log(`   - ${totalCreated} groupes créés`);
    console.log(`   - ${organizations.length} organisation(s) traitée(s)`);

    // Afficher le récapitulatif final
    const allGroups = await prisma.contactGroup.findMany({
      include: {
        organization: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            contacts: true
          }
        }
      },
      orderBy: [
        { organization: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    console.log(`\n📋 Groupes disponibles dans la base de données:`);
    let currentOrg = '';
    for (const group of allGroups) {
      if (group.organization.name !== currentOrg) {
        currentOrg = group.organization.name;
        console.log(`\n   🏢 ${currentOrg}:`);
      }
      console.log(`      📁 ${group.name} (${group._count.contacts} contact${group._count.contacts > 1 ? 's' : ''})`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des groupes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
initContactGroups();
