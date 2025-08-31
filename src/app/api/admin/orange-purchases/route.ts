import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering pour cette route
export const dynamic = 'force-dynamic';

interface PurchaseOrder {
  id: string;
  developerId: string;
  contractId: string;
  country: string;
  offerName: string;
  bundleId: string;
  bundleDescription: string;
  price: number;
  currency: string;
  purchaseDate: string;
  paymentMode: string;
  paymentProviderOrderId: string | null;
  payerId: string;
  type: string;
  oldAvailableUnits: number;
  newAvailableUnits: number;
  oldExpirationDate: string;
  newExpirationDate: string;
}

async function getOrangeAccessToken(): Promise<string> {
  const clientId = process.env.ORANGE_SMS_CLIENT_ID;
  const clientSecret = process.env.ORANGE_SMS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Orange SMS credentials not configured');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://api.orange.com/oauth/v3/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Failed to get Orange access token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function getOrangePurchaseOrders(country?: string): Promise<PurchaseOrder[]> {
  const accessToken = await getOrangeAccessToken();
  
  // Construire l'URL avec le paramètre optionnel pays
  const baseUrl = 'https://api.orange.com/sms/admin/v1/purchaseorders';
  const url = country ? `${baseUrl}?country=${country}` : baseUrl;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get Orange purchase orders: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function getFallbackPurchaseOrders(country?: string): Promise<PurchaseOrder[]> {
  try {
    const filePath = path.join(process.cwd(), 'orange-purchase-history.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const allOrders: PurchaseOrder[] = JSON.parse(fileContent);
    
    // Filtrer par pays si spécifié
    if (country) {
      return allOrders.filter(order => order.country === country);
    }
    
    return allOrders;
  } catch (error) {
    console.log('⚠️ Fichier de test non trouvé, retour de données vides');
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    // Récupérer le paramètre de requête pour le pays
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || undefined;

    console.log('🔍 Récupération de l\'historique d\'achats Orange...', { country });

    let purchaseOrders: PurchaseOrder[];
    
    try {
      purchaseOrders = await getOrangePurchaseOrders(country);
      console.log('✅ Données récupérées depuis l\'API Orange');
    } catch (error) {
      console.log('⚠️ Erreur API Orange, utilisation des données de test:', error instanceof Error ? error.message : 'Unknown error');
      purchaseOrders = await getFallbackPurchaseOrders(country);
    }

    // Calculer les statistiques
    const totalOrders = purchaseOrders.length;
    const totalSpent = purchaseOrders.reduce((sum, order) => sum + order.price, 0);
    const totalSMSPurchased = purchaseOrders.reduce((sum, order) => 
      sum + (order.newAvailableUnits - order.oldAvailableUnits), 0
    );

    // Grouper par pays
    const countrySummary: { [key: string]: { 
      orders: number; 
      spent: number; 
      sms: number; 
      currency: string;
    } } = {};

    // Grouper par type de bundle
    const bundleSummary: { [key: string]: { 
      count: number; 
      totalPrice: number; 
      totalSMS: number;
      currency: string;
    } } = {};

    // Grouper par mode de paiement
    const paymentModeSummary: { [key: string]: number } = {};

    purchaseOrders.forEach(order => {
      // Résumé par pays
      if (!countrySummary[order.country]) {
        countrySummary[order.country] = { 
          orders: 0, 
          spent: 0, 
          sms: 0, 
          currency: order.currency 
        };
      }
      countrySummary[order.country].orders += 1;
      countrySummary[order.country].spent += order.price;
      countrySummary[order.country].sms += (order.newAvailableUnits - order.oldAvailableUnits);

      // Résumé par bundle
      const bundleKey = order.bundleDescription;
      if (!bundleSummary[bundleKey]) {
        bundleSummary[bundleKey] = { 
          count: 0, 
          totalPrice: 0, 
          totalSMS: 0,
          currency: order.currency 
        };
      }
      bundleSummary[bundleKey].count += 1;
      bundleSummary[bundleKey].totalPrice += order.price;
      bundleSummary[bundleKey].totalSMS += (order.newAvailableUnits - order.oldAvailableUnits);

      // Résumé par mode de paiement
      paymentModeSummary[order.paymentMode] = (paymentModeSummary[order.paymentMode] || 0) + 1;
    });

    // Trier les commandes par date (plus récent en premier)
    const sortedOrders = purchaseOrders.sort((a, b) => 
      new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    );

    const response = {
      success: true,
      data: sortedOrders,
      summary: {
        totalOrders,
        totalSpent,
        totalSMSPurchased,
        countrySummary,
        bundleSummary,
        paymentModeSummary,
        averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
        averageSMSPerOrder: totalOrders > 0 ? totalSMSPurchased / totalOrders : 0
      },
      timestamp: new Date().toISOString()
    };

    console.log('✅ Historique d\'achats Orange récupéré:', {
      totalOrders,
      totalSpent,
      countries: Object.keys(countrySummary).length,
      bundles: Object.keys(bundleSummary).length
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'historique d\'achats Orange:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Orange purchase orders',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
