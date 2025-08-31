'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Campaign {
  id: string;
  name: string;
  message: string;
  status: string;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

export default function CampaignDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCampaign = useCallback(async (campaignId: string) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCampaign(data.data);
      } else {
        toast.error('Campagne introuvable');
        router.push('/campaigns');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la campagne:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (params.id) {
      fetchCampaign(params.id as string);
    }
  }, [isAuthenticated, router, params.id, fetchCampaign]);

  const deleteCampaign = async () => {
    if (!campaign) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la campagne "${campaign.name}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Campagne supprimée avec succès');
        router.push('/campaigns');
      } else {
        const errorData = await response.json();
        toast.error(`Erreur: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la campagne');
    }
  };

  const cancelCampaign = async () => {
    if (!campaign) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir annuler la campagne "${campaign.name}" ?`)) {
      return;
    }

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch(`/api/campaigns/${campaign.id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Campagne annulée avec succès');
        // Rafraîchir les données de la campagne
        await fetchCampaign(params.id as string);
      } else {
        const errorData = await response.json();
        toast.error(`Erreur: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      toast.error('Erreur lors de l\'annulation de la campagne');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
      sending: 'bg-blue-100 text-blue-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-orange-100 text-orange-800',
    };

    const labels = {
      draft: 'Brouillon',
      scheduled: 'Planifiée',
      sending: 'En cours',
      sent: 'Envoyée',
      failed: 'Échec',
      cancelled: 'Annulée',
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[status as keyof typeof colors] || colors.draft}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">SMS Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-700 hover:text-primary-600"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/campaigns')}
                className="text-gray-700 hover:text-primary-600"
              >
                Campagnes
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : campaign ? (
          <>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
                {getStatusBadge(campaign.status)}
              </div>
              <nav className="text-sm text-gray-500">
                <button
                  onClick={() => router.push('/campaigns')}
                  className="hover:text-primary-600"
                >
                  Campagnes
                </button>
                <span className="mx-2">/</span>
                <span>{campaign.name}</span>
              </nav>
            </div>

            {/* Campaign Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Message */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Message</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">{campaign.message}</p>
                  </div>
                  <div className="mt-4 flex justify-between text-sm text-gray-500">
                    <span>Caractères: {campaign.message.length}</span>
                    <span>SMS: {Math.ceil(campaign.message.length / 160)}</span>
                  </div>
                </div>

                {/* Actions */}
                {campaign.status === 'draft' && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                    <div className="flex flex-wrap gap-4">
                      <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                        Envoyer maintenant
                      </button>
                      <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700">
                        Planifier
                      </button>
                      <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                        Modifier
                      </button>
                      <button 
                        onClick={deleteCampaign}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Actions pour campagnes programmées */}
                {campaign.status === 'scheduled' && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                    <div className="flex flex-wrap gap-4">
                      <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                        Modifier planning
                      </button>
                      <button 
                        onClick={cancelCampaign}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Actions pour campagnes en cours */}
                {campaign.status === 'sending' && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                    <div className="flex flex-wrap gap-4">
                      <button 
                        onClick={cancelCampaign}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                      >
                        Arrêter l'envoi
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                      ⚠️ L'annulation arrêtera l'envoi des messages restants, mais les messages déjà envoyés ne peuvent pas être annulés.
                    </p>
                  </div>
                )}
                
                {/* Actions pour campagnes annulées ou échouées */}
                {(campaign.status === 'cancelled' || campaign.status === 'failed') && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                    <div className="flex flex-wrap gap-4">
                      <button 
                        onClick={deleteCampaign}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                      <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                        Dupliquer
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Campagnes envoyées - pas d'actions de modification */}
                {campaign.status === 'sent' && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                    <div className="flex flex-wrap gap-4">
                      <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                        Dupliquer
                      </button>
                      <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                        Voir rapport détaillé
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Info */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informations</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Statut</dt>
                      <dd className="mt-1">{getStatusBadge(campaign.status)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Créée le</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatDate(campaign.createdAt)}
                      </dd>
                    </div>
                    {campaign.scheduledAt && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Planifiée pour</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatDate(campaign.scheduledAt)}
                        </dd>
                      </div>
                    )}
                    {campaign.sentAt && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Envoyée le</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatDate(campaign.sentAt)}
                        </dd>
                      </div>
                    )}
                    {campaign._count && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Messages</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {campaign._count.messages} message(s)
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Stats */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Messages envoyés</span>
                      <span className="text-sm font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Taux de livraison</span>
                      <span className="text-sm font-medium">0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Échecs</span>
                      <span className="text-sm font-medium">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Campagne introuvable</h3>
            <p className="text-gray-500 mb-6">
              La campagne que vous recherchez n'existe pas ou a été supprimée.
            </p>
            <button
              onClick={() => router.push('/campaigns')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Retour aux campagnes
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
