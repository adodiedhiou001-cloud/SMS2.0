// API d'administration pour gérer les bundles SMS et allocations clients
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        return await getAdminStats();
      case 'clients':
        return await getClientsUsage();
      case 'bundles':
        return await getSMSBundles();
      default:
        return NextResponse.json({ error: 'Action non spécifiée' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erreur API admin:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

async function getAdminStats() {
  // Pour l'instant, on retourne des données simulées
  // En production, ces données viendraient de votre base de données
  
  const stats = {
    totalBundles: 3,
    totalSMSPurchased: 5000,
    totalSMSUsed: 1847,
    totalSMSRemaining: 3153,
    totalClients: 12,
    activeSubscriptions: 10,
    monthlyRevenue: 2450.00,
    
    // Statistiques détaillées
    dailyUsage: [
      { date: '2025-08-16', sms: 234 },
      { date: '2025-08-17', sms: 186 },
      { date: '2025-08-18', sms: 298 },
      { date: '2025-08-19', sms: 145 },
      { date: '2025-08-20', sms: 267 },
      { date: '2025-08-21', sms: 198 },
      { date: '2025-08-22', sms: 189 },
      { date: '2025-08-23', sms: 330 }
    ],
    
    topClients: [
      { name: 'Entreprise ABC', usage: 347, quota: 500 },
      { name: 'Boutique XYZ', usage: 298, quota: 300 },
      { name: 'Restaurant DEF', usage: 245, quota: 250 }
    ]
  };

  return NextResponse.json({ success: true, data: stats });
}

async function getClientsUsage() {
  // Simuler les données clients avec leur utilisation SMS
  const clients = [
    {
      id: '1',
      username: 'entreprise_abc',
      email: 'contact@abc.sn',
      subscriptionPlan: 'Pro',
      allocatedSMS: 500,
      usedSMS: 347,
      remainingSMS: 153,
      monthlyQuota: 500,
      subscriptionStatus: 'active',
      lastActivity: new Date().toISOString(),
      joinDate: '2025-07-15',
      totalPaid: 15000
    },
    {
      id: '2',
      username: 'boutique_xyz',
      email: 'info@xyz.sn',
      subscriptionPlan: 'Starter',
      allocatedSMS: 200,
      usedSMS: 198,
      remainingSMS: 2,
      monthlyQuota: 200,
      subscriptionStatus: 'active',
      lastActivity: new Date().toISOString(),
      joinDate: '2025-08-01',
      totalPaid: 8000
    },
    {
      id: '3',
      username: 'restaurant_def',
      email: 'admin@restaurant-def.sn',
      subscriptionPlan: 'Pro',
      allocatedSMS: 500,
      usedSMS: 245,
      remainingSMS: 255,
      monthlyQuota: 500,
      subscriptionStatus: 'active',
      lastActivity: new Date().toISOString(),
      joinDate: '2025-06-20',
      totalPaid: 25000
    }
  ];

  return NextResponse.json({ success: true, data: clients });
}

async function getSMSBundles() {
  // Simuler les bundles SMS achetés
  const bundles = [
    {
      id: '1',
      name: 'Bundle Orange 2000 SMS',
      totalSMS: 2000,
      usedSMS: 756,
      remainingSMS: 1244,
      purchaseDate: '2025-08-01',
      expiryDate: '2025-09-01',
      cost: 50000,
      isActive: true,
      provider: 'Orange Sénégal'
    },
    {
      id: '2',
      name: 'Bundle Orange 3000 SMS',
      totalSMS: 3000,
      usedSMS: 1091,
      remainingSMS: 1909,
      purchaseDate: '2025-08-15',
      expiryDate: '2025-09-15',
      cost: 70000,
      isActive: true,
      provider: 'Orange Sénégal'
    },
    {
      id: '3',
      name: 'Bundle Orange 1000 SMS (Expiré)',
      totalSMS: 1000,
      usedSMS: 1000,
      remainingSMS: 0,
      purchaseDate: '2025-07-01',
      expiryDate: '2025-08-01',
      cost: 30000,
      isActive: false,
      provider: 'Orange Sénégal'
    }
  ];

  return NextResponse.json({ success: true, data: bundles });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'allocate_sms':
        return await allocateSMSToClient(body);
      case 'add_bundle':
        return await addSMSBundle(body);
      case 'update_subscription':
        return await updateClientSubscription(body);
      default:
        return NextResponse.json({ error: 'Action non supportée' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erreur POST admin:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

async function allocateSMSToClient(data: any) {
  // Logique pour allouer des SMS à un client
  console.log('Allocation SMS à un client:', data);
  
  return NextResponse.json({
    success: true,
    message: `${data.smsAmount} SMS alloués à ${data.clientId}`
  });
}

async function addSMSBundle(data: any) {
  // Logique pour ajouter un nouveau bundle SMS
  console.log('Ajout nouveau bundle:', data);
  
  return NextResponse.json({
    success: true,
    message: `Bundle de ${data.smsAmount} SMS ajouté avec succès`
  });
}

async function updateClientSubscription(data: any) {
  // Logique pour mettre à jour l'abonnement d'un client
  console.log('Mise à jour abonnement client:', data);
  
  return NextResponse.json({
    success: true,
    message: 'Abonnement client mis à jour'
  });
}
