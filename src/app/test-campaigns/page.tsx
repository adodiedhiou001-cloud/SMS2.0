'use client';

import { useState, useEffect } from 'react';

interface Campaign {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

export default function TestCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      console.log('🔄 Tentative de récupération des campagnes...');
      
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      console.log('🔑 Token trouvé:', token ? 'OUI' : 'NON');

      const response = await fetch('/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Réponse API:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Données reçues:', data);
        setCampaigns(data.data || []);
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur API:', errorText);
        setError(`Erreur ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('💥 Erreur:', error);
      setError(`Erreur: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-2xl font-bold mb-4">🧪 Page de Test - Campagnes</h1>
        <div className="bg-yellow-100 p-4 rounded">
          ⏳ Chargement des campagnes...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-2xl font-bold mb-4">🧪 Page de Test - Campagnes</h1>
        <div className="bg-red-100 p-4 rounded mb-4">
          ❌ Erreur: {error}
        </div>
        <button 
          onClick={fetchCampaigns}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          🔄 Réessayer
        </button>
      </div>
    );
  }

  const testCampaigns = campaigns.filter(c => c.name.startsWith('TEST -'));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">🧪 Page de Test - Campagnes</h1>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-100 p-4 rounded">
          <h3 className="font-bold">📊 Total</h3>
          <p className="text-2xl">{campaigns.length}</p>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <h3 className="font-bold">🧪 Test</h3>
          <p className="text-2xl">{testCampaigns.length}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded">
          <h3 className="font-bold">🔄 Statut</h3>
          <p className="text-sm">API Fonctionnelle</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">🎯 Campagnes TEST</h2>
        {testCampaigns.length === 0 ? (
          <div className="bg-yellow-100 p-4 rounded">
            ⚠️ Aucune campagne TEST trouvée
          </div>
        ) : (
          <div className="space-y-4">
            {testCampaigns.map((campaign) => {
              const shouldShowCancel = campaign.status === 'scheduled' || campaign.status === 'sending';
              const shouldShowDelete = campaign.status === 'draft' || campaign.status === 'cancelled' || campaign.status === 'failed';
              
              return (
                <div key={campaign.id} className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{campaign.name}</h3>
                      <p className="text-sm text-gray-600">ID: {campaign.id}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                          campaign.status === 'cancelled' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                        Annuler: {shouldShowCancel ? '✅ OUI' : '❌ NON'}
                      </div>
                      <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                        Supprimer: {shouldShowDelete ? '✅ OUI' : '❌ NON'}
                      </div>
                      
                      {shouldShowCancel && (
                        <button className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-bold">
                          🚫 ANNULER
                        </button>
                      )}
                      
                      {shouldShowDelete && (
                        <button className="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold">
                          🗑️ SUPPRIMER
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">📋 Toutes les Campagnes</h2>
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Nom</th>
                <th className="px-4 py-2 text-left">Statut</th>
                <th className="px-4 py-2 text-left">Actions Possibles</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.slice(0, 10).map((campaign) => {
                const shouldShowCancel = campaign.status === 'scheduled' || campaign.status === 'sending';
                const shouldShowDelete = campaign.status === 'draft' || campaign.status === 'cancelled' || campaign.status === 'failed';
                
                return (
                  <tr key={campaign.id} className="border-t">
                    <td className="px-4 py-2">{campaign.name}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 rounded text-xs bg-gray-100">
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {shouldShowCancel && <span className="text-orange-600">🚫 Annuler </span>}
                      {shouldShowDelete && <span className="text-red-600">🗑️ Supprimer </span>}
                      {!shouldShowCancel && !shouldShowDelete && <span className="text-gray-400">Aucune</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex space-x-4">
        <button 
          onClick={fetchCampaigns}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          🔄 Actualiser
        </button>
        <a 
          href="/campaigns"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          ➡️ Page Normale
        </a>
      </div>
    </div>
  );
}
