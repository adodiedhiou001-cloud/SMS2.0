# SMS Pro - Application de Gestion de Campagnes SMS

Une application Next.js complète pour la gestion de campagnes SMS avec ciblage par groupes de contacts personnalisés.

## 🚀 Fonctionnalités

- **📊 Dashboard** - Statistiques en temps réel des campagnes et contacts
- **👥 Gestion des Contacts** - CRUD complet avec import/export
- **🏷️ Groupes Personnalisés** - Création et gestion de groupes de contacts définis par l'utilisateur
- **📱 Campagnes SMS** - Création et envoi de campagnes avec ciblage précis
- **🔐 Authentification** - Système sécurisé avec JWT
- **📈 Audit & Logs** - Traçabilité complète des actions

## 🛠️ Technologies

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Base de données:** SQLite (dev) / PostgreSQL (prod)
- **Authentification:** JWT avec bcrypt
- **UI:** Composants React personnalisés

## 📦 Installation

1. **Cloner le projet**
   ```bash
   git clone [URL_DU_DEPOT]
   cd nextjs-app
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de l'environnement**
   ```bash
   cp .env.example .env.local
   ```
   Modifier les variables d'environnement selon vos besoins.

4. **Initialiser la base de données**
   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

5. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

## 🔧 Scripts Disponibles

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Créer la version de production
- `npm run start` - Démarrer le serveur de production
- `npm run db:seed` - Peupler la base de données avec des données de test
- `npm run db:reset` - Réinitialiser la base de données

## 🔑 Authentification par Défaut

- **Username:** admin
- **Password:** admin123

## 📁 Structure du Projet

```
src/
├── app/                 # Pages Next.js App Router
│   ├── api/            # Routes API
│   ├── dashboard/      # Page tableau de bord
│   ├── contacts/       # Gestion des contacts
│   ├── groups/         # Gestion des groupes
│   └── campaigns/      # Gestion des campagnes
├── components/         # Composants React réutilisables
├── lib/               # Utilitaires et services
│   ├── auth/          # Service d'authentification
│   └── prisma.ts      # Configuration Prisma
└── middleware.ts      # Middleware Next.js

scripts/               # Scripts utilitaires
prisma/               # Schéma et migrations Prisma
```

## 🌟 Fonctionnalités Clés

### Gestion des Contacts
- Création, modification, suppression de contacts
- Assignation à des groupes personnalisés
- Recherche et filtrage avancés
- Import/export de données

### Groupes Personnalisés
- Création de groupes définis par l'utilisateur
- Aucun groupe prédéfini - liberté totale
- Gestion des couleurs et icônes
- Assignation dynamique des contacts

### Campagnes SMS
- Création de campagnes avec ciblage par groupes
- Prévisualisation du nombre de destinataires
- Programmation d'envois
- Suivi des statuts d'envoi

### Dashboard
- Statistiques en temps réel
- Métriques de performance
- Vue d'ensemble des activités
- Graphiques et indicateurs

## 🔒 Sécurité

- Authentification JWT sécurisée
- Hachage des mots de passe avec bcrypt
- Protection des routes sensibles
- Validation des entrées utilisateur
- Logs d'audit complets

## 📝 Développement

Le projet suit les meilleures pratiques Next.js :
- TypeScript strict
- ESLint configuré
- Structure modulaire
- API REST cohérente
- Gestion d'erreurs robuste

## 🚀 Déploiement

1. **Build de production**
   ```bash
   npm run build
   ```

2. **Variables d'environnement de production**
   - Configurer DATABASE_URL pour PostgreSQL
   - Définir JWT_SECRET sécurisé
   - Configurer les paramètres SMS

3. **Démarrer en production**
   ```bash
   npm start
   ```

## 📄 Licence

Projet privé - Tous droits réservés

## 🤝 Contribution

Ce projet est développé selon une approche étape par étape pour éviter les erreurs et maintenir la qualité du code.

---

**Version:** 1.0.0  
**Dernière mise à jour:** Août 2025
