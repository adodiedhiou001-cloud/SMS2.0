// API pour gérer les allocations et quotas SMS des clients
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID requis' }, { status: 400 });
    }

    // Récupérer les informations de quota du client
    const quotaInfo = await getClientQuota(clientId);
    
    return NextResponse.json({ success: true, data: quotaInfo });
  } catch (error) {
    console.error('Erreur récupération quota:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, clientId, amount, plan } = body;

    switch (action) {
      case 'allocate':
        return await allocateQuota(clientId, amount);
      case 'deduct':
        return await deductQuota(clientId, amount);
      case 'reset':
        return await resetQuota(clientId);
      case 'update_plan':
        return await updateSubscriptionPlan(clientId, plan);
      default:
        return NextResponse.json({ error: 'Action non supportée' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erreur modification quota:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

async function getClientQuota(clientId: string) {
  // Pour l'instant, données simulées
  // En production, récupérer depuis la base de données
  
  const quotaData = {
    clientId,
    username: `client_${clientId}`,
    currentQuota: 250,
    usedSMS: 167,
    remainingSMS: 83,
    monthlyAllocation: 250,
    subscriptionPlan: 'Starter',
    planPrice: 5000, // Prix en FCFA
    renewalDate: '2025-09-22',
    isActive: true,
    
    // Historique d'utilisation
    usageHistory: [
      { date: '2025-08-16', sent: 23, remaining: 227 },
      { date: '2025-08-17', sent: 19, remaining: 208 },
      { date: '2025-08-18', sent: 31, remaining: 177 },
      { date: '2025-08-19', sent: 15, remaining: 162 },
      { date: '2025-08-20', sent: 28, remaining: 134 },
      { date: '2025-08-21', sent: 22, remaining: 112 },
      { date: '2025-08-22', sent: 17, remaining: 95 },
      { date: '2025-08-23', sent: 12, remaining: 83 }
    ],
    
    // Alertes et notifications
    alerts: [
      {
        type: 'warning',
        message: 'Il vous reste moins de 35% de votre quota mensuel',
        date: new Date().toISOString()
      }
    ]
  };

  return quotaData;
}

async function allocateQuota(clientId: string, amount: number) {
  // Logique d'allocation de quota
  console.log(`Allocation de ${amount} SMS au client ${clientId}`);
  
  // Simuler la mise à jour en base de données
  // await prisma.clientQuota.update({
  //   where: { clientId },
  //   data: { 
  //     currentQuota: { increment: amount },
  //     remainingSMS: { increment: amount }
  //   }
  // });

  return NextResponse.json({
    success: true,
    message: `${amount} SMS alloués avec succès`,
    newQuota: 250 + amount,
    timestamp: new Date().toISOString()
  });
}

async function deductQuota(clientId: string, amount: number) {
  // Logique de déduction de quota (lors d'envoi SMS)
  console.log(`Déduction de ${amount} SMS du client ${clientId}`);
  
  // Vérifier si le client a suffisamment de SMS
  const currentQuota = 83; // Récupérer depuis la base
  
  if (currentQuota < amount) {
    return NextResponse.json({
      success: false,
      error: 'Quota insuffisant',
      remaining: currentQuota
    }, { status: 400 });
  }

  // Simuler la déduction
  // await prisma.clientQuota.update({
  //   where: { clientId },
  //   data: { 
  //     usedSMS: { increment: amount },
  //     remainingSMS: { decrement: amount }
  //   }
  // });

  return NextResponse.json({
    success: true,
    message: `${amount} SMS déduits`,
    newRemaining: currentQuota - amount,
    timestamp: new Date().toISOString()
  });
}

async function resetQuota(clientId: string) {
  // Remettre à zéro le quota du client (renouvellement mensuel)
  console.log(`Reset quota du client ${clientId}`);
  
  // Récupérer le plan du client pour connaître son allocation mensuelle
  const monthlyAllocation = 250; // Récupérer depuis la base
  
  // await prisma.clientQuota.update({
  //   where: { clientId },
  //   data: { 
  //     usedSMS: 0,
  //     remainingSMS: monthlyAllocation,
  //     lastReset: new Date()
  //   }
  // });

  return NextResponse.json({
    success: true,
    message: 'Quota réinitialisé',
    newQuota: monthlyAllocation,
    resetDate: new Date().toISOString()
  });
}

async function updateSubscriptionPlan(clientId: string, newPlan: string) {
  // Mettre à jour le plan d'abonnement du client
  console.log(`Mise à jour plan du client ${clientId} vers ${newPlan}`);
  
  const planQuotas = {
    'Starter': 200,
    'Pro': 500,
    'Enterprise': 1000,
    'Premium': 2000
  };

  const planPrices = {
    'Starter': 5000,
    'Pro': 12000,
    'Enterprise': 25000,
    'Premium': 45000
  };

  const newQuota = planQuotas[newPlan as keyof typeof planQuotas] || 200;
  const newPrice = planPrices[newPlan as keyof typeof planPrices] || 5000;

  // await prisma.clientSubscription.update({
  //   where: { clientId },
  //   data: { 
  //     plan: newPlan,
  //     monthlyQuota: newQuota,
  //     monthlyPrice: newPrice,
  //     updatedAt: new Date()
  //   }
  // });

  return NextResponse.json({
    success: true,
    message: `Plan mis à jour vers ${newPlan}`,
    newQuota,
    newPrice,
    timestamp: new Date().toISOString()
  });
}
