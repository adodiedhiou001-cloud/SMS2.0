import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering pour cette route
export const dynamic = 'force-dynamic';

interface CountryStatistics {
  appid: string;
  usage: number;
  nbEnforcements: number;
}

interface ServiceStatistics {
  country: string;
  countryStatistics: CountryStatistics[];
}

interface Statistics {
  service: string;
  serviceStatistics: ServiceStatistics[];
}

interface OrangeStatisticsResponse {
  partnerStatistics: {
    developerId: string;
    statistics: Statistics[];
  };
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

async function getOrangeStatisticsData(country?: string, appId?: string): Promise<OrangeStatisticsResponse> {
  const accessToken = await getOrangeAccessToken();
  
  // Construire l'URL avec les paramètres optionnels
  const baseUrl = 'https://api.orange.com/sms/admin/v1/statistics';
  const params = new URLSearchParams();
  if (country) params.append('country', country);
  if (appId) params.append('appid', appId);
  
  const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get Orange statistics: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || undefined;
    const appId = searchParams.get('appid') || undefined;

    console.log('🔍 Récupération des statistiques Orange...', { country, appId });

    const statisticsData = await getOrangeStatisticsData(country, appId);

    // Calculer les totaux
    let totalUsage = 0;
    let totalEnforcements = 0;
    const countrySummary: { [key: string]: { usage: number; enforcements: number } } = {};
    const appSummary: { [key: string]: { usage: number; enforcements: number } } = {};

    statisticsData.partnerStatistics.statistics.forEach(stat => {
      stat.serviceStatistics.forEach(serviceStat => {
        serviceStat.countryStatistics.forEach(countryStat => {
          totalUsage += countryStat.usage;
          totalEnforcements += countryStat.nbEnforcements;

          // Résumé par pays
          if (!countrySummary[serviceStat.country]) {
            countrySummary[serviceStat.country] = { usage: 0, enforcements: 0 };
          }
          countrySummary[serviceStat.country].usage += countryStat.usage;
          countrySummary[serviceStat.country].enforcements += countryStat.nbEnforcements;

          // Résumé par application
          if (!appSummary[countryStat.appid]) {
            appSummary[countryStat.appid] = { usage: 0, enforcements: 0 };
          }
          appSummary[countryStat.appid].usage += countryStat.usage;
          appSummary[countryStat.appid].enforcements += countryStat.nbEnforcements;
        });
      });
    });

    const response = {
      success: true,
      data: statisticsData,
      summary: {
        totalUsage,
        totalEnforcements,
        countrySummary,
        appSummary,
        developerId: statisticsData.partnerStatistics.developerId
      },
      timestamp: new Date().toISOString()
    };

    console.log('✅ Statistiques Orange récupérées:', {
      totalUsage,
      countries: Object.keys(countrySummary).length,
      apps: Object.keys(appSummary).length
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques Orange:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Orange statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
