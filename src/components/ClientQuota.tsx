// Composant pour afficher le quota SMS du client (remplace SMSBalance)
'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import './client-quota.css';

interface ClientQuota {
  currentQuota: number;
  usedSMS: number;
  remainingSMS: number;
  monthlyAllocation: number;
  subscriptionPlan: string;
  planPrice: number;
  renewalDate: string;
  isActive: boolean;
}

export default function ClientQuota() {
  const [quota, setQuota] = useState<ClientQuota | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { user } = useAuth();

  const checkQuota = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/quota?clientId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setQuota(data.data);
        setLastCheck(new Date());
      } else {
        console.error('Erreur lors de la récupération du quota:', data.error);
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkQuota();
  }, [checkQuota]);

  const getUsagePercentage = () => {
    if (!quota) return 0;
    return Math.round((quota.usedSMS / quota.monthlyAllocation) * 100);
  };

  const getStatusIcon = () => {
    if (!quota) return <MessageSquare className="w-6 h-6 text-gray-400" />;
    
    const percentage = getUsagePercentage();
    if (percentage >= 90) {
      return <AlertCircle className="w-6 h-6 text-red-500" />;
    } else if (percentage >= 70) {
      return <AlertCircle className="w-6 h-6 text-orange-500" />;
    } else {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
  };

  const getStatusColor = () => {
    if (!quota) return 'bg-gray-50 border-gray-200';
    
    const percentage = getUsagePercentage();
    if (percentage >= 90) {
      return 'bg-red-50 border-red-200';
    } else if (percentage >= 70) {
      return 'bg-orange-50 border-orange-200';
    } else {
      return 'bg-green-50 border-green-200';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className={`p-6 rounded-lg border-2 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Votre quota SMS
            </h3>
            {lastCheck && (
              <p className="text-sm text-gray-500">
                Mis à jour : {lastCheck.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        
        <button
          onClick={checkQuota}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {quota && (
        <div className="space-y-4">
          {/* Statistiques de quota */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{quota.monthlyAllocation}</p>
              <p className="text-sm text-gray-500">Quota mensuel</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{quota.usedSMS}</p>
              <p className="text-sm text-gray-500">Utilisés</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{quota.remainingSMS}</p>
              <p className="text-sm text-gray-500">Restants</p>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full quota-progress-bar"
              ref={(el) => {
                if (el) {
                  el.style.setProperty('--progress-width', `${getUsagePercentage()}%`);
                }
              }}
            ></div>
          </div>
          <p className="text-sm text-center text-gray-600">
            {getUsagePercentage()}% utilisé
          </p>

          {/* Informations du plan */}
          <div className="mt-4 p-3 bg-white rounded border">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">Plan {quota.subscriptionPlan}</p>
                <p className="text-sm text-gray-600">
                  Renouvellement : {new Date(quota.renewalDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{quota.planPrice.toLocaleString()} FCFA</p>
                <p className="text-sm text-gray-600">par mois</p>
              </div>
            </div>
          </div>

          {/* Alertes */}
          {getUsagePercentage() >= 90 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700">
                ⚠️ Attention ! Il vous reste moins de 10% de votre quota mensuel.
              </p>
            </div>
          )}
          
          {getUsagePercentage() >= 70 && getUsagePercentage() < 90 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
              <p className="text-sm text-orange-700">
                💡 Il vous reste moins de 30% de votre quota mensuel.
              </p>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-blue-600">Vérification en cours...</span>
        </div>
      )}
    </div>
  );
}
