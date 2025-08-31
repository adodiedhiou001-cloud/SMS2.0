# 📋 Guide de Gestion des Groupes et Contacts SMS Pro

## 🚀 Étapes pour commencer avec vos propres données

### 1. 🧹 Nettoyer les données de test (Optionnel)
Si vous voulez partir d'une base propre sans les données de démonstration :
```bash
cd "G:\SMS Pro 3\nextjs-app"
node scripts/clean-test-data.js
```

### 2. 📁 Créer vos groupes de contacts

1. **Accédez à la page des groupes :**
   - URL : http://localhost:3003/contact-groups
   - Ou depuis le dashboard : Bouton "Gérer les groupes"

2. **Créez vos premiers groupes :**
   - Cliquez sur "Nouveau groupe"
   - Donnez un nom descriptif (ex: "Clients VIP", "Prospects", "Équipe")
   - Ajoutez une description (optionnel)
   - Choisissez une couleur pour identifier visuellement le groupe
   - Cliquez sur "Créer le groupe"

3. **Exemples de groupes utiles :**
   - 🌟 **Clients VIP** : Vos meilleurs clients
   - 🎯 **Prospects** : Contacts potentiels
   - 👥 **Équipe** : Membres de votre équipe
   - 🤝 **Partenaires** : Partenaires commerciaux
   - 📢 **Marketing** : Liste pour les campagnes promotionnelles
   - 🛍️ **Clients Premium** : Clients avec abonnement premium

### 3. 👤 Ajouter vos contacts

1. **Accédez à la page d'ajout de contact :**
   - URL : http://localhost:3003/contacts/new
   - Ou depuis la page contacts : Bouton "Nouveau contact"

2. **Remplissez les informations :**
   - **Prénom et Nom** (requis)
   - **Téléphone** (requis) - Format international automatique (+33...)
   - **Email** (optionnel)
   - **Groupe de contact** : Sélectionnez le groupe approprié
   - Cliquez sur "Créer le contact"

3. **Conseils pour les numéros de téléphone :**
   - Utilisez le format international : +33612345678
   - Ou saisissez un numéro français : 0612345678 (sera automatiquement converti)

### 4. 🎯 Créer des campagnes ciblées

1. **Accédez à la création de campagne :**
   - URL : http://localhost:3003/campaigns/new

2. **Configurez votre campagne :**
   - Donnez un nom à votre campagne
   - Rédigez votre message SMS
   - **Choisissez votre ciblage :**
     - "Tous mes contacts" : Envoie à tous vos contacts
     - "Groupes spécifiques" : Sélectionnez un ou plusieurs groupes
   - Prévisualisez le nombre de contacts ciblés et le coût estimé
   - Planifiez l'envoi (immédiat ou différé)

3. **Avantages du ciblage par groupes :**
   - 📊 Messages plus pertinents
   - 💰 Optimisation des coûts
   - 📈 Meilleur taux de réponse
   - 🎯 Campagnes personnalisées

## 🔧 Fonctionnalités disponibles

### Gestion des Groupes
- ✅ Créer des groupes personnalisés
- ✅ Modifier nom, description et couleur
- ✅ Supprimer des groupes
- ✅ Voir le nombre de contacts par groupe
- ✅ Filtrer les contacts par groupe

### Gestion des Contacts
- ✅ Ajouter des contacts avec groupes
- ✅ Assigner/Réassigner des contacts à des groupes
- ✅ Rechercher dans les contacts
- ✅ Filtrer par groupe
- ✅ Modifier et supprimer des contacts

### Campagnes SMS
- ✅ Ciblage précis par groupes
- ✅ Aperçu en temps réel du ciblage
- ✅ Estimation des coûts
- ✅ Planification des envois
- ✅ Historique des campagnes

## 📱 Interface Utilisateur

Votre application SMS Pro est accessible à : **http://localhost:3003**

**Identifiants de connexion :**
- Nom d'utilisateur : `admin`
- Mot de passe : `admin123`

## 🎯 Workflow recommandé

1. **Planification :** Réfléchissez à vos différents types de contacts
2. **Groupes :** Créez 3-5 groupes principaux pour commencer
3. **Contacts :** Ajoutez vos contacts en les assignant aux bons groupes
4. **Test :** Créez une première campagne de test sur un petit groupe
5. **Déploiement :** Lancez vos campagnes ciblées

## 💡 Bonnes pratiques

- **Nommage des groupes :** Utilisez des noms clairs et descriptifs
- **Mise à jour régulière :** Révisez vos groupes périodiquement
- **Test avant envoi :** Vérifiez toujours vos campagnes avant l'envoi
- **Respect des contacts :** Respectez les préférences de vos contacts
- **Segmentation fine :** Plus vos groupes sont précis, plus vos messages seront efficaces

Bonne utilisation de SMS Pro ! 🚀
