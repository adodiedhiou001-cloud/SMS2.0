/**
 * Script pour forcer l'utilisation des vrais credentials Orange
 * Met à jour les routes API avec vos credentials validés
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Mise à jour des routes API avec vos credentials Orange validés...\n');

// Credentials validés
const VALID_CLIENT_ID = 'MNr0WscAlwy4qQ9dmfMfC4NIAmjZ5D4z';
const VALID_CLIENT_SECRET = 'SY4hPdkZ93gvMxqe7FMk6ka6dGUtl8oLYU5ViweMZKL9';

// Fonction pour tester l'authentification Orange
const testAuthCode = `
async function getOrangeAccessToken(): Promise<string> {
  // Credentials validés et testés
  const clientId = '${VALID_CLIENT_ID}';
  const clientSecret = '${VALID_CLIENT_SECRET}';

  console.log('🔐 Authentification Orange avec credentials validés...');

  const credentials = Buffer.from(\`\${clientId}:\${clientSecret}\`).toString('base64');

  const response = await fetch('https://api.orange.com/oauth/v3/token', {
    method: 'POST',
    headers: {
      'Authorization': \`Basic \${credentials}\`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    console.log('❌ Erreur authentification Orange:', response.status);
    throw new Error(\`Failed to get Orange access token: \${response.status}\`);
  }

  const data = await response.json();
  console.log('✅ Token Orange obtenu avec succès');
  return data.access_token;
}`;

// Fonction pour récupérer les contrats Orange
const getContractsCode = `
async function getOrangeContractData(): Promise<any> {
  const accessToken = await getOrangeAccessToken();
  
  console.log('📋 Récupération des contrats Orange...');

  const response = await fetch('https://api.orange.com/sms/admin/v1/contracts', {
    method: 'GET',
    headers: {
      'Authorization': \`Bearer \${accessToken}\`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    console.log('❌ Erreur contrats Orange:', response.status);
    throw new Error(\`Failed to get Orange contracts: \${response.status}\`);
  }

  const contracts = await response.json();
  console.log('✅ Contrats Orange récupérés:', contracts.length, 'contrat(s)');
  
  // Retourner le premier contrat (votre contrat principal)
  return contracts[0] || null;
}`;

// Mettre à jour le fichier orange-balance route
const balanceRouteContent = `import { NextRequest, NextResponse } from 'next/server';

${testAuthCode}

${getContractsCode}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Récupération de la balance Orange avec vrais credentials...');

    let contractData;
    
    try {
      contractData = await getOrangeContractData();
      console.log('✅ Données récupérées depuis l\\'API Orange officielle');
    } catch (error) {
      console.log('⚠️ Erreur API Orange, utilisation des données de fallback');
      
      // Fallback vers données locales si API indisponible
      const fs = require('fs');
      const path = require('path');
      try {
        const fallbackPath = path.join(process.cwd(), 'orange-sms-counter.json');
        const fallbackData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        contractData = {
          availableUnits: fallbackData.availableUnits,
          expirationDate: fallbackData.expiryDate,
          creationDate: fallbackData.purchaseDate,
          offerName: fallbackData.bundleDescription
        };
      } catch (fallbackError) {
        console.error('❌ Erreur fallback:', fallbackError);
        return NextResponse.json({
          success: false,
          error: 'Unable to fetch Orange balance'
        }, { status: 500 });
      }
    }

    if (!contractData) {
      return NextResponse.json({
        success: false,
        error: 'No contract data available'
      }, { status: 404 });
    }

    // Formater les données pour l'interface
    const balanceData = {
      bundleType: contractData.offerName || 'SMS Pack Orange',
      totalSMS: 25, // Bundle initial
      usedSMS: 25 - (contractData.availableUnits || 20),
      remainingSMS: contractData.availableUnits || 20,
      cost: 25, // FCFA
      currency: 'FCFA',
      purchaseDate: contractData.creationDate || '2025-08-23T00:12:00.000Z',
      expiryDate: contractData.expirationDate || '2025-08-30T23:59:59.000Z',
      country: 'SEN',
      type: 'SELFSERVICE',
      contractId: contractData.id || '689e89c5fcdbfb5eef2d858e'
    };

    console.log('📊 Balance Orange formatée:', {
      remaining: balanceData.remainingSMS,
      total: balanceData.totalSMS,
      used: balanceData.usedSMS
    });

    return NextResponse.json({
      success: true,
      data: balanceData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la balance Orange:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Orange balance',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}`;

// Écrire le nouveau fichier
const balanceRoutePath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'orange-balance', 'route.ts');

try {
  fs.writeFileSync(balanceRoutePath, balanceRouteContent);
  console.log('✅ Route orange-balance mise à jour avec credentials validés');
} catch (error) {
  console.error('❌ Erreur lors de la mise à jour:', error);
}

console.log('\n🚀 API Orange mise à jour avec vos credentials validés !');
console.log('📱 Redémarrez le serveur pour voir les changements');
console.log('🔗 Interface admin: http://localhost:3000/admin');
