// Composant pour afficher le solde SMS Orange
'use client';

import { useState, useEffect } from 'react';
import { Smartphone, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface SMSBalanceStatus {
  status: 'active' | 'expired' | 'no_credits' | 'error' | 'unknown';
  message: string;
  details: string;
}

export default function SMSBalance() {
  const [balance, setBalance] = useState<SMSBalanceStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkBalance = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sms/status');
      const data = await response.json();
      
      if (data.success) {
        setBalance(data.data);
        setLastCheck(new Date());
      } else {
        setBalance({
          status: 'error',
          message: 'Erreur lors de la vérification',
          details: data.error || 'Erreur inconnue'
        });
      }
    } catch (error) {
      setBalance({
        status: 'error',
        message: 'Erreur de connexion',
        details: 'Impossible de vérifier le statut'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBalance();
  }, []);

  const getStatusIcon = () => {
    if (!balance) return <Smartphone className="w-6 h-6 text-gray-400" />;
    
    switch (balance.status) {
      case 'active':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'expired':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'no_credits':
        return <AlertCircle className="w-6 h-6 text-orange-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    if (!balance) return 'bg-gray-50 border-gray-200';
    
    switch (balance.status) {
      case 'active':
        return 'bg-green-50 border-green-200';
      case 'expired':
        return 'bg-red-50 border-red-200';
      case 'no_credits':
        return 'bg-orange-50 border-orange-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Statut SMS Orange
            </h3>
            {lastCheck && (
              <p className="text-sm text-gray-500">
                Dernière vérification : {lastCheck.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        
        <button
          onClick={checkBalance}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {balance && (
        <div className="space-y-2">
          <p className="font-medium text-gray-900">
            {balance.message}
          </p>
          <p className="text-sm text-gray-600">
            {balance.details}
          </p>
          
          {balance.status === 'active' && (
            <div className="mt-4 p-3 bg-white rounded border">
              <p className="text-sm text-gray-700">
                ✅ Votre API Orange est fonctionnelle et prête à envoyer des SMS.
              </p>
            </div>
          )}
          
          {balance.status === 'expired' && (
            <div className="mt-4 p-3 bg-white rounded border">
              <p className="text-sm text-gray-700">
                📞 Contactez Orange ou visitez : 
                <br />
                <a 
                  href="https://developer.orange.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://developer.orange.com
                </a>
              </p>
            </div>
          )}
          
          {balance.status === 'no_credits' && (
            <div className="mt-4 p-3 bg-white rounded border">
              <p className="text-sm text-gray-700">
                💳 Rechargez votre compte Orange pour continuer l'envoi de SMS.
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
