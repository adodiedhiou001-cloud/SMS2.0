# 🔧 Configuration de l'API Orange SMS - Guide Complet

## 📋 Étapes pour obtenir vos credentials

### 1. Inscription sur Orange Developer Portal
1. Allez sur: https://developer.orange.com
2. Créez un compte ou connectez-vous
3. Activez votre compte par email

### 2. Créer une application SMS
1. Dans le portail, allez dans "My Apps"
2. Cliquez sur "Add App" ou "Créer une application"
3. Choisissez le service "SMS API"
4. Remplissez les informations de votre app:
   - **Nom**: SMS Pro SaaS
   - **Description**: Plateforme SaaS d'envoi de SMS
   - **URL de callback**: http://localhost:3001
   - **Pays**: Sénégal (SEN) ou votre pays

### 3. Souscrire au service SMS
1. Dans votre application, allez dans "Subscriptions"
2. Souscrivez au service "SMS API"
3. Choisissez votre plan (Freemium, Starter, etc.)
4. Validez votre souscription

### 4. Récupérer vos credentials
1. Dans votre app, allez dans "Keys"
2. Copiez votre **Client ID** et **Client Secret**
3. Ces informations sont sensibles, gardez-les secrètes !

## 🔑 Configuration dans SMS Pro

### 1. Éditez le fichier `.env.local`
```bash
# Remplacez ces valeurs par vos vrais credentials:
ORANGE_SMS_CLIENT_ID=votre_client_id_ici
ORANGE_SMS_CLIENT_SECRET=votre_client_secret_ici
```

### 2. Testez votre configuration
```bash
cd "G:\SMS Pro 3\nextjs-app"
node scripts/test-orange-api.js
```

### 3. Redémarrez votre serveur
```bash
npm run dev
```

## 📦 Acheter des SMS

### Via le portail Orange Developer
1. Connectez-vous sur https://developer.orange.com
2. Allez dans votre application
3. Section "Billing" ou "Purchase"
4. Achetez un bundle SMS (ex: 25 SMS pour 500 FCFA)

### Via l'API (programmatique)
```javascript
// Votre app SMS Pro peut aussi acheter des SMS automatiquement
// en utilisant l'API Orange Purchase
```

## 🛠️ Résolution des problèmes courants

### Erreur 401 (Non autorisé)
- ✅ Vérifiez que vos credentials sont corrects
- ✅ Assurez-vous que votre app est activée
- ✅ Vérifiez que vous avez souscrit au service SMS

### Erreur 403 (Interdit)
- ✅ Vérifiez que votre souscription est active
- ✅ Vérifiez que vous avez des SMS disponibles
- ✅ Assurez-vous que votre pays est supporté

### Erreur 404 (Non trouvé)
- ✅ Vérifiez l'URL de l'API (https://api.orange.com)
- ✅ Vérifiez la version de l'API (/v1/)

### Pas de balance/contrats
- ✅ Achetez un premier bundle SMS
- ✅ Attendez quelques minutes pour la synchronisation
- ✅ Vérifiez dans le portail Orange que l'achat est confirmé

## 📞 Support Orange

Si vous avez des problèmes:
- 📧 Support email: developer@orange.com
- 📚 Documentation: https://developer.orange.com/docs
- 💬 Forum: https://developer.orange.com/forum

## 🎯 Pays supportés

L'API Orange SMS fonctionne dans ces pays:
- 🇸🇳 Sénégal (SEN)
- 🇨🇮 Côte d'Ivoire (CIV)
- 🇨🇲 Cameroun (CMR)
- 🇲🇱 Mali (MLI)
- 🇧🇫 Burkina Faso (BFA)
- 🇳🇪 Niger (NER)
- 🇬🇳 Guinée (GIN)
- 🇲🇬 Madagascar (MDG)
- Et d'autres...

## ✅ Validation finale

Une fois configuré, votre SMS Pro SaaS aura:
- ✅ Balance SMS en temps réel
- ✅ Statistiques d'usage par pays/app
- ✅ Historique complet des achats
- ✅ Gestion automatique des quotas clients
- ✅ Interface admin complète

Bon développement ! 🚀
