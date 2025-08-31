# 🚀 Script de mise à jour SMS Pro 3 (PowerShell)
# Usage: .\update-app.ps1

Write-Host "🔄 Mise à jour de l'application SMS Pro 3" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Vérifier qu'on est sur development
$currentBranch = git branch --show-current
if ($currentBranch -ne "development") {
    Write-Host "⚠️  Attention: Vous n'êtes pas sur la branche development" -ForegroundColor Yellow
    Write-Host "📝 Basculement automatique..." -ForegroundColor Yellow
    git checkout development
}

Write-Host "📦 1. Mise à jour du code local..." -ForegroundColor Cyan
git pull origin development

Write-Host "🧪 2. Tests automatiques..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tests réussis!" -ForegroundColor Green
} else {
    Write-Host "❌ Tests échoués - Annulation de la mise à jour" -ForegroundColor Red
    exit 1
}

Write-Host "🔍 3. Validation des changements..." -ForegroundColor Cyan
Write-Host "Changements depuis le dernier déploiement:" -ForegroundColor Yellow
git log --oneline main..development

$confirm = Read-Host "Voulez-vous continuer le déploiement? (y/n)"
if ($confirm -ne "y") {
    Write-Host "❌ Déploiement annulé" -ForegroundColor Red
    exit 0
}

Write-Host "🚀 4. Déploiement en production..." -ForegroundColor Cyan
git checkout main
git merge development
git push origin main

Write-Host "✅ Mise à jour déployée avec succès!" -ForegroundColor Green
Write-Host "🌐 Votre site sera mis à jour automatiquement dans 2-3 minutes" -ForegroundColor Yellow
Write-Host "📊 Vérifiez: https://votre-site.vercel.app" -ForegroundColor Yellow
