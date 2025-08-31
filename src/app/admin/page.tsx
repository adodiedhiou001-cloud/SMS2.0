// Page d'administration SMS (accessible uniquement aux admins)
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSMSManager from '@/components/AdminSMSManager';
import QuotaManagement from '@/components/QuotaManagement';

export default function AdminPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      // Vérifier si l'utilisateur est l'admin Damzo
      if (user && user.username !== 'Damzo') {
        // Rediriger les non-admins vers le dashboard normal
        router.push('/dashboard');
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId);
    setActiveTab('quota');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Administration SMS Pro</h1>
          <p className="text-gray-600">Gestion des clients et des quotas SMS</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Navigation par onglets */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tableau de bord
            </button>
            <button
              onClick={() => setActiveTab('quota')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'quota'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gestion des quotas
              {selectedClient && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Client sélectionné
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'dashboard' && (
          <AdminSMSManager onClientSelect={handleClientSelect} />
        )}

        {activeTab === 'quota' && (
          <div>
            {selectedClient ? (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Gestion du quota - Client {selectedClient}</h2>
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    ← Retour à la liste
                  </button>
                </div>
                <QuotaManagement
                  clientId={selectedClient}
                  onQuotaUpdate={(newQuota) => {
                    console.log(`Quota mis à jour: ${newQuota}`);
                    // Optionnel: rafraîchir les données du dashboard
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-400">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun client sélectionné</h3>
                <p className="mt-2 text-gray-500">
                  Sélectionnez un client depuis le tableau de bord pour gérer son quota SMS.
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Voir les clients
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
