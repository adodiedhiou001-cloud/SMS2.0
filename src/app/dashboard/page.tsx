'use client';

import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import './dashboard.css';

export default function DashboardPage() {
  const { user, organization, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const { data, loading: dashboardLoading, error, refetch } = useDashboard();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
              <Link
                href="/groups"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Groupes de contacts
              </Link>
              <Link
                href="/contacts"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Contacts
              </Link>
              <Link
                href="/campaigns"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Campagnes
              </Link>
              <span className="text-sm text-gray-700">
                Bonjour, {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Erreur de chargement</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={refetch}
                      className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                    >
                      Réessayer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Contacts
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {data?.stats.totalContacts || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📱</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Campagnes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {data?.stats.totalCampaigns || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">💬</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Messages envoyés
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {data?.stats.totalMessages || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Taux de succès
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {data?.stats.totalMessages ? 
                          Math.round(((data.stats.messageStats.sent || 0) / data.stats.totalMessages) * 100) + '%' 
                          : '0%'
                        }
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Contacts */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Contacts récents
                  </h3>
                  <Link
                    href="/groups"
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    Voir tous →
                  </Link>
                </div>
                
                {data?.recentContacts.length ? (
                  <div className="space-y-3">
                    {data.recentContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div 
                            className="contact-avatar w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                            ref={(el) => {
                              if (el) {
                                el.style.setProperty('--avatar-color', contact.group?.color || '#6B7280');
                              }
                            }}
                          >
                            {contact.firstName[0]}{contact.lastName[0]}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {contact.firstName} {contact.lastName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {contact.phone}
                          </p>
                          {contact.group && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {contact.group.name}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(contact.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">Aucun contact pour le moment</p>
                    <Link
                      href="/contacts/new"
                      className="mt-2 text-primary-600 hover:text-primary-500 text-sm"
                    >
                      Ajouter votre premier contact
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Campaigns */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Campagnes récentes
                  </h3>
                  <Link
                    href="/campaigns"
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    Voir toutes →
                  </Link>
                </div>
                
                {data?.recentCampaigns.length ? (
                  <div className="space-y-3">
                    {data.recentCampaigns.map((campaign) => (
                      <div key={campaign.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {campaign.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {campaign.message}
                            </p>
                            <div className="flex items-center mt-2 space-x-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                                campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {campaign.status === 'sent' ? 'Envoyée' :
                                 campaign.status === 'scheduled' ? 'Programmée' :
                                 campaign.status === 'draft' ? 'Brouillon' : campaign.status}
                              </span>
                              <span className="text-xs text-gray-500">
                                {campaign._count.messages} message(s)
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 ml-2">
                            {formatDate(campaign.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">Aucune campagne pour le moment</p>
                    <Link
                      href="/campaigns"
                      className="mt-2 text-primary-600 hover:text-primary-500 text-sm"
                    >
                      Créer votre première campagne
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Actions rapides
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    href="/contacts"
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">👥 Gérer les contacts</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Organisez vos contacts en groupes et ajoutez de nouveaux contacts.
                    </p>
                    <span className="text-primary-600 text-sm font-medium">
                      Aller aux contacts →
                    </span>
                  </Link>
                  
                  <Link
                    href="/campaigns"
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">📱 Créer une campagne</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Créez et envoyez votre campagne SMS à vos contacts.
                    </p>
                    <span className="text-primary-600 text-sm font-medium">
                      Nouvelle campagne →
                    </span>
                  </Link>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">📊 Analyses</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Consultez les performances de vos campagnes SMS.
                    </p>
                    <span className="text-gray-400 text-sm">
                      Bientôt disponible
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
