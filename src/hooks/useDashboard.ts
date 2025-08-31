import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface DashboardStats {
  totalContacts: number;
  totalCampaigns: number;
  totalMessages: number;
  messageStats: Record<string, number>;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  company?: string;
  createdAt: string;
  group?: {
    name: string;
    color: string;
  };
}

interface Campaign {
  id: string;
  name: string;
  message: string;
  status: string;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  _count: {
    messages: number;
  };
}

interface DashboardData {
  stats: DashboardStats;
  recentContacts: Contact[];
  recentCampaigns: Campaign[];
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error('Réponse invalide du serveur');
      }
    } catch (err: any) {
      console.error('Erreur dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData,
  };
}
