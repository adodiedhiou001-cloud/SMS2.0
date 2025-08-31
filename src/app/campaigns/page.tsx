'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  message: string;
  status: string;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  _count?: {
    messages: number;
  };
}

export default function CampaignsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [newScheduleDate, setNewScheduleDate] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchCampaigns();

    // Fermer le menu lors du clic à l'extérieur
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-menu')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isAuthenticated, router]);

  const fetchCampaigns = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch('/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des campagnes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCampaign = async (campaignId: string, campaignName: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    const isEffectuee = campaign?.status === 'sent' || campaign?.status === 'partially_sent';
    
    const message = isEffectuee 
      ? `Êtes-vous sûr de vouloir supprimer de l'historique la campagne "${campaignName}" ? Cette action est irréversible.`
      : `Êtes-vous sûr de vouloir supprimer la campagne "${campaignName}" ? Cette action est irréversible.`;
      
    if (!confirm(message)) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(campaignId));

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Rafraîchir la liste des campagnes
        await fetchCampaigns();
        // Notification de succès (vous pouvez ajouter react-hot-toast si nécessaire)
        alert('Campagne supprimée avec succès');
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la campagne');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(campaignId);
        return newSet;
      });
    }
  };

  const cancelCampaign = async (campaignId: string, campaignName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir annuler la campagne "${campaignName}" ?`)) {
      return;
    }

    setCancellingIds(prev => new Set(prev).add(campaignId));

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch(`/api/campaigns/${campaignId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Rafraîchir la liste des campagnes
        await fetchCampaigns();
        alert('Campagne annulée avec succès');
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      alert('Erreur lors de l\'annulation de la campagne');
    } finally {
      setCancellingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(campaignId);
        return newSet;
      });
    }
  };

  const updateSchedule = async (campaignId: string, campaignName: string) => {
    if (!newScheduleDate) {
      alert('Veuillez sélectionner une nouvelle date et heure');
      return;
    }

    const newDate = new Date(newScheduleDate);
    const now = new Date();
    
    if (newDate <= now) {
      alert('La date de planification doit être dans le futur');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir reprogrammer la campagne "${campaignName}" pour le ${newDate.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })} ?`)) {
      return;
    }

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduledAt: newScheduleDate
        }),
      });

      if (response.ok) {
        // Rafraîchir la liste des campagnes
        await fetchCampaigns();
        alert('Planning modifié avec succès');
        setEditingScheduleId(null);
        setNewScheduleDate('');
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la modification du planning:', error);
      alert('Erreur lors de la modification du planning');
    }
  };

  const handleEditSchedule = (campaign: Campaign) => {
    setEditingScheduleId(campaign.id);
    setOpenMenuId(null);
    
    // Pré-remplir avec la date actuelle programmée
    if (campaign.scheduledAt) {
      const currentDate = new Date(campaign.scheduledAt);
      // Format pour input datetime-local
      const formattedDate = currentDate.toISOString().slice(0, 16);
      setNewScheduleDate(formattedDate);
    }
  };

  const sendCampaignNow = async (campaignId: string, campaignName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir envoyer maintenant la campagne "${campaignName}" ?`)) {
      return;
    }

    setSendingIds(prev => new Set(prev).add(campaignId));

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch(`/api/campaigns/${campaignId}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Rafraîchir la liste des campagnes
        await fetchCampaigns();
        alert(`✅ Campagne envoyée avec succès !`);
      } else {
        const errorData = await response.json();
        alert(`❌ Erreur: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la campagne:', error);
      alert('❌ Erreur lors de l\'envoi de la campagne');
    } finally {
      setSendingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(campaignId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sending: 'bg-blue-100 text-blue-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-orange-100 text-orange-800',
      partially_sent: 'bg-green-100 text-green-800',
    };

    const labels = {
      draft: 'Brouillon',
      scheduled: 'Programmée',
      sending: 'En cours',
      sent: 'Effectuée',
      failed: 'Échec',
      cancelled: 'Annulée',
      partially_sent: 'Effectuée',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.draft}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
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
              <span className="text-primary-600 font-medium">Campagnes</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Campagnes SMS</h1>
              <p className="mt-2 text-gray-600">
                Gérez vos campagnes SMS et suivez leurs performances.
              </p>
            </div>
            <Link
              href="/campaigns/new"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              + Nouvelle campagne
            </Link>
          </div>

          {/* Campaigns List */}
          {isLoading ? (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v8a2 2 0 002 2h6a2 2 0 002-2V8" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune campagne</h3>
              <p className="text-gray-500 mb-6">
                Vous n'avez pas encore créé de campagne SMS. Commencez dès maintenant !
              </p>
              <Link
                href="/campaigns/new"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Créer ma première campagne
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <li key={campaign.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {campaign.name}
                            </h3>
                            <div className="flex items-center space-x-3">
                              {getStatusBadge(campaign.status)}
                              
                              {/* Menu hamburger */}
                              <div className="relative dropdown-menu">
                                <button
                                  onClick={() => setOpenMenuId(openMenuId === campaign.id ? null : campaign.id)}
                                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                                  title="Actions"
                                >
                                  <div className="flex flex-col space-y-1">
                                    <div className="w-4 h-0.5 bg-gray-600"></div>
                                    <div className="w-4 h-0.5 bg-gray-600"></div>
                                    <div className="w-4 h-0.5 bg-gray-600"></div>
                                  </div>
                                </button>

                                {/* Menu déroulant */}
                                {openMenuId === campaign.id && (
                                  <div className="absolute right-0 top-10 bg-white border rounded-lg shadow-lg z-10 min-w-48">
                                    {/* Option VOIR - toujours disponible */}
                                    <button
                                      onClick={() => {
                                        router.push(`/campaigns/${campaign.id}`);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b"
                                    >
                                      VOIR
                                    </button>

                                    {/* Option ENVOYER MAINTENANT - seulement pour les brouillons */}
                                    {campaign.status === 'draft' && (
                                      <button
                                        onClick={() => {
                                          sendCampaignNow(campaign.id, campaign.name);
                                          setOpenMenuId(null);
                                        }}
                                        disabled={sendingIds.has(campaign.id)}
                                        className="w-full text-left px-4 py-2 hover:bg-green-50 disabled:opacity-50 text-sm border-b text-green-600"
                                      >
                                        {sendingIds.has(campaign.id) ? 'Envoi en cours...' : '📱 ENVOYER MAINTENANT'}
                                      </button>
                                    )}

                                    {/* Option MODIFIER PLANNING - seulement pour les campagnes programmées */}
                                    {campaign.status === 'scheduled' && (
                                      <button
                                        onClick={() => handleEditSchedule(campaign)}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b text-blue-600"
                                      >
                                        MODIFIER PLANNING
                                      </button>
                                    )}

                                    {/* Option ANNULER - seulement pour les campagnes programmées */}
                                    {campaign.status === 'scheduled' && (
                                      <button
                                        onClick={() => {
                                          cancelCampaign(campaign.id, campaign.name);
                                          setOpenMenuId(null);
                                        }}
                                        disabled={cancellingIds.has(campaign.id)}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 disabled:opacity-50 text-sm border-b"
                                      >
                                        {cancellingIds.has(campaign.id) ? 'Annulation...' : 'ANNULER'}
                                      </button>
                                    )}

                                    {/* Option SUPPRIMER - pour brouillons et échecs */}
                                    {(campaign.status === 'draft' || campaign.status === 'failed') && (
                                      <button
                                        onClick={() => {
                                          deleteCampaign(campaign.id, campaign.name);
                                          setOpenMenuId(null);
                                        }}
                                        disabled={deletingIds.has(campaign.id)}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 disabled:opacity-50 text-sm text-red-600"
                                      >
                                        {deletingIds.has(campaign.id) ? 'Suppression...' : 'SUPPRIMER'}
                                      </button>
                                    )}

                                    {/* Option SUPPRIMER DE L'HISTORIQUE - pour campagnes effectuées */}
                                    {(campaign.status === 'sent' || campaign.status === 'partially_sent') && (
                                      <button
                                        onClick={() => {
                                          deleteCampaign(campaign.id, campaign.name);
                                          setOpenMenuId(null);
                                        }}
                                        disabled={deletingIds.has(campaign.id)}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 disabled:opacity-50 text-sm text-gray-600"
                                      >
                                        {deletingIds.has(campaign.id) ? 'Suppression...' : 'SUPPRIMER DE L\'HISTORIQUE'}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {campaign.message}
                          </p>
                          <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                            <span>
                              Créée le {formatDate(campaign.createdAt)}
                            </span>
                            {campaign.scheduledAt && (
                              <span>
                                Planifiée pour le {formatDate(campaign.scheduledAt)}
                              </span>
                            )}
                            {campaign.sentAt && (
                              <span>
                                Envoyée le {formatDate(campaign.sentAt)}
                              </span>
                            )}
                            {campaign._count && (
                              <span>
                                {campaign._count.messages} message(s)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interface de modification du planning */}
          {editingScheduleId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Modifier le planning</h3>
                <div className="mb-4">
                  <label htmlFor="newScheduleDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Nouvelle date et heure d'envoi :
                  </label>
                  <input
                    type="datetime-local"
                    id="newScheduleDate"
                    value={newScheduleDate}
                    onChange={(e) => setNewScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setEditingScheduleId(null);
                      setNewScheduleDate('');
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      const campaign = campaigns.find(c => c.id === editingScheduleId);
                      if (campaign) {
                        updateSchedule(editingScheduleId, campaign.name);
                      }
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
