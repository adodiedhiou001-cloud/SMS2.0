# 🚀 Script de déploiement automatique SMS Pro 3 (PowerShell)
# Usage: .\deploy.ps1 [vercel|netlify|docker]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("vercel", "netlify", "docker")]
    [string]$Platform
)

Write-Host "🚀 Déploiement SMS Pro 3" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

# Vérifier que nous sommes dans le bon dossier
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté depuis le dossier nextjs-app" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Vérification des prérequis..." -ForegroundColor Yellow

# Vérifier Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installé: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé" -ForegroundColor Red
    exit 1
}

# Vérifier npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm installé: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm n'est pas installé" -ForegroundColor Red
    exit 1
}

# Installation des dépendances
Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
npm install

# Build de l'application
Write-Host "🔨 Build de l'application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build terminé avec succès" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}

# Déploiement selon la plateforme
switch ($Platform) {
    "vercel" {
        Write-Host "🌐 Déploiement sur Vercel..." -ForegroundColor Cyan
        
        try {
            vercel --version | Out-Null
        } catch {
            Write-Host "📦 Installation de Vercel CLI..." -ForegroundColor Yellow
            npm install -g vercel
        }
        
        Write-Host "🚀 Lancement du déploiement Vercel..." -ForegroundColor Yellow
        vercel --prod
    }
    
    "netlify" {
        Write-Host "🌊 Déploiement sur Netlify..." -ForegroundColor Cyan
        
        try {
            netlify --version | Out-Null
        } catch {
            Write-Host "📦 Installation de Netlify CLI..." -ForegroundColor Yellow
            npm install -g netlify-cli
        }
        
        Write-Host "🚀 Lancement du déploiement Netlify..." -ForegroundColor Yellow
        netlify deploy --prod --dir=.next
    }
    
    "docker" {
        Write-Host "🐳 Déploiement avec Docker..." -ForegroundColor Cyan
        
        try {
            docker --version | Out-Null
        } catch {
            Write-Host "❌ Docker n'est pas installé" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "🔨 Construction de l'image Docker..." -ForegroundColor Yellow
        docker build -t sms-pro-3 .
        
        Write-Host "🚀 Lancement du conteneur..." -ForegroundColor Yellow
        docker run -d -p 3000:3000 --name sms-pro-3-app sms-pro-3
        
        Write-Host "✅ Application déployée sur http://localhost:3000" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎉 Déploiement terminé avec succès!" -ForegroundColor Green
Write-Host "📋 N'oubliez pas de configurer vos variables d'environnement" -ForegroundColor Yellow
Write-Host "🔧 Variables requises:" -ForegroundColor Yellow
Write-Host "   - DATABASE_URL" -ForegroundColor White
Write-Host "   - NEXTAUTH_SECRET" -ForegroundColor White
Write-Host "   - NEXTAUTH_URL" -ForegroundColor White
Write-Host "   - ORANGE_SMS_CLIENT_ID" -ForegroundColor White
Write-Host "   - ORANGE_SMS_CLIENT_SECRET" -ForegroundColor White
Write-Host "   - JWT_SECRET" -ForegroundColor White
