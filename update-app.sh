#!/bin/bash
# 🚀 Script de mise à jour SMS Pro 3
# Usage: ./update-app.sh

echo "🔄 Mise à jour de l'application SMS Pro 3"
echo "========================================"

# Vérifier qu'on est sur development
current_branch=$(git branch --show-current)
if [ "$current_branch" != "development" ]; then
    echo "⚠️  Attention: Vous n'êtes pas sur la branche development"
    echo "📝 Basculement automatique..."
    git checkout development
fi

echo "📦 1. Mise à jour du code local..."
git pull origin development

echo "🧪 2. Tests automatiques..."
npm test --if-present
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Tests réussis!"
else
    echo "❌ Tests échoués - Annulation de la mise à jour"
    exit 1
fi

echo "🔍 3. Validation des changements..."
echo "Changements depuis le dernier déploiement:"
git log --oneline main..development

read -p "Voulez-vous continuer le déploiement? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "❌ Déploiement annulé"
    exit 0
fi

echo "🚀 4. Déploiement en production..."
git checkout main
git merge development
git push origin main

echo "✅ Mise à jour déployée avec succès!"
echo "🌐 Votre site sera mis à jour automatiquement dans 2-3 minutes"
echo "📊 Vérifiez: https://votre-site.vercel.app"
