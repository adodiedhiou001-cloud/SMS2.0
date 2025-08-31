// Composant pour afficher le solde réel Orange SMS (Admin uniquement)
'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, AlertTriangle, TrendingUp, Package, Clock, Smartphone, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import './admin-sms.css';

interface OrangeBalance {
  bundleType: string;
  initialSMS: number;
  usedSMS: number;
  remainingSMS: number;
  purchaseDate: string;
  expiryDate: string;
  cost: string;
  status: 'active' | 'expired';
  lastUpdated: string;
  apiStatus: string;
  contractId?: string;
  country?: string;
  type?: string;
}

export default function OrangeBalanceAdmin() {
  const [balance, setBalance] = useState<OrangeBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const fetchBalance = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/orange-balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBalance(data.data);
        setLastCheck(new Date());
      } else {
        setError(data.error || 'Erreur lors de la récupération du solde');
      }
    } catch (err) {
      setError('Erreur de connexion à l\'API');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    
    // Actualiser automatiquement toutes les 5 minutes
    const interval = setInterval(fetchBalance, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getUsagePercentage = () => {
    if (!balance) return 0;
    return Math.round((balance.usedSMS / balance.initialSMS) * 100);
  };

  const getDaysRemaining = () => {
    if (!balance) return 0;
    const expiry = new Date(balance.expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getStatusColor = () => {
    if (!balance) return 'border-gray-200 bg-gray-50';
    
    if (balance.status === 'expired') {
      return 'border-red-200 bg-red-50';
    }
    
    const usage = getUsagePercentage();
    const daysLeft = getDaysRemaining();
    
    if (usage >= 90 || daysLeft <= 2) {
      return 'border-red-200 bg-red-50';
    } else if (usage >= 70 || daysLeft <= 7) {
      return 'border-orange-200 bg-orange-50';
    } else {
      return 'border-green-200 bg-green-50';
    }
  };

  const getStatusIcon = () => {
    if (!balance) return <Package className="w-8 h-8 text-gray-400" />;
    
    if (balance.status === 'expired') {
      return <AlertCircle className="w-8 h-8 text-red-500" />;
    }
    
    const usage = getUsagePercentage();
    const daysLeft = getDaysRemaining();
    
    if (usage >= 90 || daysLeft <= 2) {
      return <AlertCircle className="w-8 h-8 text-red-500" />;
    } else if (usage >= 70 || daysLeft <= 7) {
      return <AlertCircle className="w-8 h-8 text-orange-500" />;
    } else {
      return <CheckCircle className="w-8 h-8 text-green-500" />;
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">
              Erreur de récupération du solde Orange
            </h3>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchBalance}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-2 rounded-lg p-6 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {getStatusIcon()}
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Solde Orange SMS Réel
            </h3>
            <p className="text-sm text-gray-600">
              {balance?.bundleType || 'Bundle Orange'}
            </p>
            {lastCheck && (
              <p className="text-xs text-gray-500">
                Dernière vérification : {lastCheck.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        
        <button
          onClick={fetchBalance}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {balance && (
        <div className="space-y-6">
          {/* Statistiques principales */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-3xl font-bold text-blue-600">{balance.initialSMS}</p>
              <p className="text-sm text-gray-500">SMS Total</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-3xl font-bold text-orange-600">{balance.usedSMS}</p>
              <p className="text-sm text-gray-500">Utilisés</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-3xl font-bold text-green-600">{balance.remainingSMS}</p>
              <p className="text-sm text-gray-500">Restants</p>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Utilisation: {getUsagePercentage()}%</span>
              <span>{balance.remainingSMS} SMS restants</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-orange-500 h-4 rounded-full orange-balance-progress"
                ref={(el) => {
                  if (el) {
                    el.style.setProperty('--progress-width', `${getUsagePercentage()}%`);
                  }
                }}
              ></div>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Détails du bundle</span>
              </div>
              <p className="text-sm text-gray-600">Coût: {balance.cost} FCFA</p>
              <p className="text-sm text-gray-600">
                Acheté: {new Date(balance.purchaseDate).toLocaleDateString()}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Expiration</span>
              </div>
              <p className="text-sm text-gray-600">
                {new Date(balance.expiryDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                {getDaysRemaining()} jours restants
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                <span className="font-medium">Contrat Orange</span>
              </div>
              {balance.contractId && (
                <p className="text-xs text-gray-600 truncate">ID: {balance.contractId}</p>
              )}
              <p className="text-sm text-gray-600">
                Pays: {balance.country || 'SEN'}
              </p>
              <p className="text-sm text-gray-600">
                Type: {balance.type || 'SELFSERVICE'}
              </p>
            </div>
          </div>

          {/* Alertes */}
          {balance.status === 'expired' && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4">
              <p className="text-red-800 font-medium">
                ⚠️ Bundle expiré ! Rechargez votre compte Orange pour continuer l'envoi de SMS.
              </p>
            </div>
          )}

          {balance.status === 'active' && getUsagePercentage() >= 90 && (
            <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
              <p className="text-orange-800 font-medium">
                ⚠️ Plus que {balance.remainingSMS} SMS restants ! Préparez le prochain achat.
              </p>
            </div>
          )}

          {balance.status === 'active' && getDaysRemaining() <= 7 && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
              <p className="text-yellow-800 font-medium">
                ⏰ Bundle expire dans {getDaysRemaining()} jours !
              </p>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-blue-600">Récupération du solde...</span>
        </div>
      )}
    </div>
  );
}
