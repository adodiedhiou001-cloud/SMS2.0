#!/bin/bash

# 🚀 Script de déploiement automatique SMS Pro 3
# Usage: ./deploy.sh [vercel|netlify|docker]

set -e

echo "🚀 Déploiement SMS Pro 3"
echo "========================"

# Vérifier les arguments
if [ $# -eq 0 ]; then
    echo "❌ Erreur: Veuillez spécifier la plateforme de déploiement"
    echo "Usage: ./deploy.sh [vercel|netlify|docker]"
    exit 1
fi

PLATFORM=$1

# Vérifier que nous sommes dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le dossier nextjs-app"
    exit 1
fi

echo "📋 Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

echo "✅ Node.js et npm sont installés"

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# Build de l'application
echo "🔨 Build de l'application..."
npm run build

echo "✅ Build terminé avec succès"

# Déploiement selon la plateforme
case $PLATFORM in
    vercel)
        echo "🌐 Déploiement sur Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "📦 Installation de Vercel CLI..."
            npm install -g vercel
        fi
        
        echo "🚀 Lancement du déploiement Vercel..."
        vercel --prod
        ;;
        
    netlify)
        echo "🌊 Déploiement sur Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "📦 Installation de Netlify CLI..."
            npm install -g netlify-cli
        fi
        
        echo "🚀 Lancement du déploiement Netlify..."
        netlify deploy --prod --dir=.next
        ;;
        
    docker)
        echo "🐳 Déploiement avec Docker..."
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker n'est pas installé"
            exit 1
        fi
        
        echo "🔨 Construction de l'image Docker..."
        docker build -t sms-pro-3 .
        
        echo "🚀 Lancement du conteneur..."
        docker run -d -p 3000:3000 --name sms-pro-3-app sms-pro-3
        
        echo "✅ Application déployée sur http://localhost:3000"
        ;;
        
    *)
        echo "❌ Plateforme non supportée: $PLATFORM"
        echo "Plateformes supportées: vercel, netlify, docker"
        exit 1
        ;;
esac

echo ""
echo "🎉 Déploiement terminé avec succès!"
echo "📋 N'oubliez pas de configurer vos variables d'environnement"
echo "🔧 Variables requises:"
echo "   - DATABASE_URL"
echo "   - NEXTAUTH_SECRET"
echo "   - NEXTAUTH_URL"
echo "   - ORANGE_SMS_CLIENT_ID"
echo "   - ORANGE_SMS_CLIENT_SECRET"
echo "   - JWT_SECRET"
