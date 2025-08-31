const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SMS_TEMPLATES = [
  // Catégorie: Bienvenue
  {
    name: "Bienvenue - Nouveau Client",
    category: "bienvenue",
    channel: "sms",
    content: "🎉 Bienvenue chez [COMPANY] ! Votre compte est activé. Profitez de -15% avec le code BIENVENUE15 sur votre première commande. Valable 30 jours.",
    isSystem: true,
    tags: JSON.stringify(["bienvenue", "nouveau", "client", "inscription"]),
    variables: JSON.stringify(["COMPANY", "PRENOM", "NOM"]),
    promoCode: "BIENVENUE15",
    promoValue: "15%",
    promoExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
  },
  {
    name: "Bienvenue - Programme VIP",
    category: "bienvenue",
    channel: "sms",
    content: "✨ Félicitations [PRENOM] ! Vous êtes maintenant membre VIP. Profitez de -25% avec VIP25 + livraison gratuite. Bienvenue dans l'élite !",
    isSystem: true,
    tags: JSON.stringify(["bienvenue", "vip", "programme", "fidélité"]),
    variables: JSON.stringify(["PRENOM", "NOM", "COMPANY"]),
    promoCode: "VIP25",
    promoValue: "25%",
    promoExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 jours
  },

  // Catégorie: Promotions
  {
    name: "Flash Sale - 24h",
    category: "promotion",
    channel: "sms",
    content: "⚡ FLASH SALE ! -50% sur TOUT pendant 24h seulement ! Code: FLASH50 🔥 Dépêchez-vous sur [WEBSITE] Fin à minuit !",
    isSystem: true,
    tags: JSON.stringify(["promotion", "flash", "urgent", "limite"]),
    variables: JSON.stringify(["WEBSITE", "COMPANY"]),
    promoCode: "FLASH50",
    promoValue: "50%",
    promoExpiry: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 24h
  },
  {
    name: "Week-end Spécial",
    category: "promotion",
    channel: "sms",
    content: "🎉 Week-end EXCEPTIONNEL ! -30% avec WEEKEND30 + livraison express gratuite. Valable jusqu'à dimanche 23h59. Ne ratez pas ça !",
    isSystem: true,
    tags: JSON.stringify(["promotion", "weekend", "livraison"]),
    variables: JSON.stringify(["PRENOM", "COMPANY"]),
    promoCode: "WEEKEND30",
    promoValue: "30%",
    promoExpiry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 jours
  },
  {
    name: "Soldes d'été",
    category: "promotion",
    channel: "sms",
    content: "☀️ SOLDES D'ÉTÉ ! Jusqu'à -70% sur toute la collection été ! Code: SOLDES70 Livraison gratuite dès 50€. C'est parti !",
    isSystem: true,
    tags: JSON.stringify(["soldes", "été", "collection", "livraison"]),
    variables: JSON.stringify(["PRENOM", "COMPANY"]),
    promoCode: "SOLDES70",
    promoValue: "70%",
    promoExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
  },

  // Catégorie: Anniversaire
  {
    name: "Bon anniversaire - Cadeau",
    category: "anniversaire",
    channel: "sms",
    content: "🎂 Joyeux anniversaire [PRENOM] ! 🎁 Votre cadeau vous attend : -20% avec ANNIV20 + un petit cadeau surprise. Profitez-en vite !",
    isSystem: true,
    tags: JSON.stringify(["anniversaire", "cadeau", "personnel"]),
    variables: JSON.stringify(["PRENOM", "NOM", "AGE"]),
    promoCode: "ANNIV20",
    promoValue: "20%",
    promoExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
  },
  {
    name: "Anniversaire VIP",
    category: "anniversaire",
    channel: "sms",
    content: "🌟 Bon anniversaire [PRENOM] ! En tant que membre VIP, profitez de -40% avec VIPANNIV40 + livraison premium offerte. Bon anniversaire !",
    isSystem: true,
    tags: JSON.stringify(["anniversaire", "vip", "premium"]),
    variables: JSON.stringify(["PRENOM", "NOM", "AGE"]),
    promoCode: "VIPANNIV40",
    promoValue: "40%",
    promoExpiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 jours
  },

  // Catégorie: Fidélisation
  {
    name: "Merci fidélité",
    category: "fidelisation",
    channel: "sms",
    content: "💎 Merci pour votre fidélité [PRENOM] ! Voici votre récompense : -25% avec FIDELE25 + points doublés sur votre prochaine commande.",
    isSystem: true,
    tags: JSON.stringify(["fidélité", "remerciement", "points"]),
    variables: JSON.stringify(["PRENOM", "NOM", "POINTS"]),
    promoCode: "FIDELE25",
    promoValue: "25%",
    promoExpiry: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) // 21 jours
  },
  {
    name: "Retour client",
    category: "fidelisation",
    channel: "sms",
    content: "💕 Ça nous a manqué [PRENOM] ! Revenez avec -30% sur votre commande de retour : RETOUR30. Nous avons plein de nouveautés !",
    isSystem: true,
    tags: JSON.stringify(["retour", "réactivation", "nouveautés"]),
    variables: JSON.stringify(["PRENOM", "NOM", "DERNIERE_COMMANDE"]),
    promoCode: "RETOUR30",
    promoValue: "30%",
    promoExpiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 jours
  },

  // Catégorie: Événements
  {
    name: "Saint-Valentin",
    category: "evenement",
    channel: "sms",
    content: "💕 Saint-Valentin : L'amour est dans l'air ! -35% sur tous nos cadeaux avec LOVE35. Livraison gratuite pour faire plaisir !",
    isSystem: true,
    tags: JSON.stringify(["saint-valentin", "amour", "cadeaux"]),
    variables: JSON.stringify(["PRENOM", "PARTENAIRE"]),
    promoCode: "LOVE35",
    promoValue: "35%",
    promoExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
  },
  {
    name: "Black Friday",
    category: "evenement",
    channel: "sms",
    content: "🖤 BLACK FRIDAY ! Notre plus grosse promo : -60% sur TOUT avec BLACK60 ! Stock limité, ne tardez pas ! Lien : [WEBSITE]",
    isSystem: true,
    tags: JSON.stringify(["black-friday", "méga-promo", "stock"]),
    variables: JSON.stringify(["WEBSITE", "PRENOM"]),
    promoCode: "BLACK60",
    promoValue: "60%",
    promoExpiry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 jours
  },
  {
    name: "Fête des Mères",
    category: "evenement",
    channel: "sms",
    content: "🌸 Fête des Mères : Gâtez maman ! -25% sur notre sélection spéciale avec MAMAN25. Livraison express disponible jusqu'au [DATE].",
    isSystem: true,
    tags: JSON.stringify(["fête-des-mères", "maman", "express"]),
    variables: JSON.stringify(["PRENOM", "DATE", "SELECTION"]),
    promoCode: "MAMAN25",
    promoValue: "25%",
    promoExpiry: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 jours
  },

  // Catégorie: Abandon panier
  {
    name: "Panier abandonné - 1ère relance",
    category: "abandon_panier",
    channel: "sms",
    content: "🛒 Oups ! Vous avez oublié quelque chose dans votre panier. Finalisez maintenant avec -10% : PANIER10. Vos articles vous attendent !",
    isSystem: true,
    tags: JSON.stringify(["abandon", "panier", "relance", "première"]),
    variables: JSON.stringify(["PRENOM", "PRODUITS", "MONTANT"]),
    promoCode: "PANIER10",
    promoValue: "10%",
    promoExpiry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 jours
  },
  {
    name: "Panier abandonné - Dernière chance",
    category: "abandon_panier",
    channel: "sms",
    content: "⏰ DERNIÈRE CHANCE ! Votre panier expire dans 2h. Sauvez-le avec -20% : URGENT20. Ne laissez pas passer cette occasion !",
    isSystem: true,
    tags: JSON.stringify(["abandon", "urgent", "dernière", "chance"]),
    variables: JSON.stringify(["PRENOM", "PRODUITS", "MONTANT"]),
    promoCode: "URGENT20",
    promoValue: "20%",
    promoExpiry: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 heures
  },

  // Catégorie: Confirmation commande
  {
    name: "Commande confirmée",
    category: "commande",
    channel: "sms",
    content: "✅ Commande confirmée ! N° [NUMERO_COMMANDE]. Livraison prévue le [DATE_LIVRAISON]. Suivi : [LIEN_SUIVI]. Merci [PRENOM] !",
    isSystem: true,
    tags: JSON.stringify(["confirmation", "commande", "livraison", "suivi"]),
    variables: JSON.stringify(["NUMERO_COMMANDE", "DATE_LIVRAISON", "LIEN_SUIVI", "PRENOM"])
  },
  {
    name: "Expédition confirmée",
    category: "commande",
    channel: "sms",
    content: "📦 C'est parti ! Votre commande [NUMERO_COMMANDE] a été expédiée. Livraison demain avant 18h. Suivi : [LIEN_SUIVI]",
    isSystem: true,
    tags: JSON.stringify(["expédition", "livraison", "suivi"]),
    variables: JSON.stringify(["NUMERO_COMMANDE", "LIEN_SUIVI", "TRANSPORTEUR"])
  },

  // Catégorie: Service client
  {
    name: "Support disponible",
    category: "service_client",
    channel: "sms",
    content: "🆘 Besoin d'aide [PRENOM] ? Notre équipe est là ! Répondez HELP ou appelez le [TELEPHONE]. Nous sommes à votre service 7j/7.",
    isSystem: true,
    tags: JSON.stringify(["support", "aide", "équipe", "service"]),
    variables: JSON.stringify(["PRENOM", "TELEPHONE", "EMAIL_SUPPORT"])
  },
  {
    name: "Satisfaction client",
    category: "service_client",
    channel: "sms",
    content: "⭐ Comment s'est passée votre commande [PRENOM] ? Notez-nous en 30s : [LIEN_AVIS]. Votre avis compte et nous aide à nous améliorer !",
    isSystem: true,
    tags: JSON.stringify(["satisfaction", "avis", "évaluation"]),
    variables: JSON.stringify(["PRENOM", "LIEN_AVIS", "NUMERO_COMMANDE"])
  }
];

async function initializeSMSTemplates() {
  try {
    console.log('🚀 Initialisation des templates SMS...');

    // Récupérer toutes les organisations
    const organizations = await prisma.organization.findMany();
    
    if (organizations.length === 0) {
      console.log('❌ Aucune organisation trouvée. Créez d\'abord une organisation.');
      return;
    }

    let totalCreated = 0;

    for (const org of organizations) {
      console.log(`\n📊 Organisation: ${org.name} (${org.id})`);
      
      // Vérifier les templates existants pour cette organisation
      const existingTemplates = await prisma.template.findMany({
        where: { organizationId: org.id }
      });

      console.log(`   Templates existants: ${existingTemplates.length}`);

      for (const template of SMS_TEMPLATES) {
        // Vérifier si le template existe déjà
        const exists = existingTemplates.find(
          t => t.name === template.name && t.category === template.category
        );

        if (!exists) {
          await prisma.template.create({
            data: {
              ...template,
              organizationId: org.id
            }
          });
          totalCreated++;
          console.log(`   ✅ Créé: ${template.name}`);
        } else {
          console.log(`   ⏭️  Existe: ${template.name}`);
        }
      }
    }

    console.log(`\n🎉 Initialisation terminée !`);
    console.log(`📈 Templates créés: ${totalCreated}`);
    console.log(`📂 Catégories disponibles: bienvenue, promotion, anniversaire, fidelisation, evenement, abandon_panier, commande, service_client`);

    // Afficher un résumé par catégorie
    console.log('\n📋 Résumé par catégorie:');
    const templatesByCategory = SMS_TEMPLATES.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {});

    Object.entries(templatesByCategory).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} templates`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  initializeSMSTemplates();
}

module.exports = { initializeSMSTemplates, SMS_TEMPLATES };
