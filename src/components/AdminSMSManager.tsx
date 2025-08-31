'use client';

import React, { useState, useEffect } from 'react';
import './admin-sms.css';
import OrangeBalanceAdmin from './OrangeBalanceAdmin';
import OrangeStatisticsAdmin from './OrangeStatisticsAdmin';
import OrangePurchaseHistoryAdmin from './OrangePurchaseHistoryAdmin';
import { 
  Users, 
  BarChart3, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle,
  DollarSign,
  MessageSquare,
  TrendingUp,
  Smartphone,
  Package,
  CreditCard,
  Eye,
  ShoppingCart
} from 'lucide-react';

interface AdminSMSManagerProps {
  onClientSelect?: (clientId: string) => void;
}

interface SMSStats {
  totalBundles: number;
  totalSMSPurchased: number;
  totalSMSUsed: number;
  totalSMSRemaining: number;
  totalClients: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
}

interface ClientUsage {
  id: string;
  username: string;
  email: string;
  subscriptionPlan: string;
  allocatedSMS: number;
  usedSMS: number;
  remainingSMS: number;
  monthlyQuota: number;
  subscriptionStatus: 'active' | 'expired' | 'suspended';
  lastActivity: string;
}

interface SMSBundle {
  id: string;
  name: string;
  totalSMS: number;
  usedSMS: number;
  remainingSMS: number;
  purchaseDate: string;
  expiryDate?: string;
  cost: number;
  isActive: boolean;
}

export default function AdminSMSManager({ onClientSelect }: AdminSMSManagerProps) {
  const [stats, setStats] = useState<SMSStats | null>(null);
  const [clients, setClients] = useState<ClientUsage[]>([]);
  const [bundles, setBundles] = useState<SMSBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'bundles' | 'statistics' | 'purchases'>('overview');

  // Données simulées pour la démonstration
  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setStats({
        totalBundles: 3,
        totalSMSPurchased: 5000,
        totalSMSUsed: 1847,
        totalSMSRemaining: 3153,
        totalClients: 12,
        activeSubscriptions: 10,
        monthlyRevenue: 2450.00
      });

      setClients([
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
          lastActivity: '2025-08-23T10:30:00Z'
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
          lastActivity: '2025-08-23T09:15:00Z'
        }
      ]);

      setBundles([
        {
          id: '1',
          name: 'Bundle Orange 2000 SMS',
          totalSMS: 2000,
          usedSMS: 756,
          remainingSMS: 1244,
          purchaseDate: '2025-08-01',
          expiryDate: '2025-09-01',
          cost: 50000,
          isActive: true
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
          isActive: true
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const getUsagePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'suspended': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administration SMS</h1>
              <p className="text-gray-600">Gestion des bundles SMS et clients</p>
            </div>
            <div className="flex space-x-4">
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                <span>Nouveau Bundle</span>
              </button>
              <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                <Users className="w-4 h-4" />
                <span>Ajouter Client</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
              { id: 'clients', label: 'Clients', icon: Users },
              { id: 'bundles', label: 'Bundles SMS', icon: Package },
              { id: 'statistics', label: 'Statistiques', icon: BarChart3 },
              { id: 'purchases', label: 'Achats', icon: ShoppingCart }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">SMS Restants</p>
                    <p className="text-2xl font-bold text-green-600">{stats?.totalSMSRemaining?.toLocaleString()}</p>
                  </div>
                  <Smartphone className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {getUsagePercentage(stats?.totalSMSUsed || 0, stats?.totalSMSPurchased || 1)}% utilisés
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clients Actifs</p>
                    <p className="text-2xl font-bold text-blue-600">{stats?.activeSubscriptions}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Sur {stats?.totalClients} clients</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bundles Actifs</p>
                    <p className="text-2xl font-bold text-purple-600">{stats?.totalBundles}</p>
                  </div>
                  <Package className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">{stats?.totalSMSPurchased?.toLocaleString()} SMS totaux</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenus Mensuels</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats?.monthlyRevenue?.toLocaleString()} FCFA</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-yellow-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Ce mois</p>
              </div>
            </div>

            {/* Solde Orange Réel */}
            <div className="mb-6">
              <OrangeBalanceAdmin />
            </div>

            {/* Usage Chart Placeholder */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Utilisation SMS par jour</h3>
              <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                <p className="text-gray-500">Graphique d'utilisation (à implémenter)</p>
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Gestion des Clients</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abonnement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SMS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{client.username}</div>
                          <div className="text-sm text-gray-500">{client.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{client.subscriptionPlan}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {client.usedSMS} / {client.allocatedSMS}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="usage-bar bg-blue-600 h-2 rounded-full" 
                            ref={(el) => {
                              if (el) {
                                el.style.setProperty('--usage-width', `${getUsagePercentage(client.usedSMS, client.allocatedSMS)}%`);
                              }
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.subscriptionStatus)}`}>
                          {client.subscriptionStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir les détails"
                          aria-label="Voir les détails du client"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900"
                          title="Modifier"
                          aria-label="Modifier le client"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-purple-600 hover:text-purple-900"
                          title="Paramètres"
                          aria-label="Paramètres du client"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bundles Tab */}
        {activeTab === 'bundles' && (
          <div className="space-y-6">
            {bundles.map((bundle) => (
              <div key={bundle.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{bundle.name}</h3>
                    <p className="text-sm text-gray-500">Acheté le {new Date(bundle.purchaseDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Coût: {bundle.cost.toLocaleString()} FCFA</p>
                    {bundle.expiryDate && (
                      <p className="text-sm text-orange-600">Expire le {new Date(bundle.expiryDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{bundle.totalSMS.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total SMS</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{bundle.usedSMS.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Utilisés</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{bundle.remainingSMS.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Restants</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="quota-progress-bar bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full" 
                    ref={(el) => {
                      if (el) {
                        el.style.setProperty('--progress-width', `${getUsagePercentage(bundle.usedSMS, bundle.totalSMS)}%`);
                      }
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {getUsagePercentage(bundle.usedSMS, bundle.totalSMS)}% utilisé
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <OrangeStatisticsAdmin />
          </div>
        )}

        {/* Purchases Tab */}
        {activeTab === 'purchases' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <OrangePurchaseHistoryAdmin />
          </div>
        )}
      </div>
    </div>
  );
}
