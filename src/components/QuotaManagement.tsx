'use client';

import React, { useState, useEffect, useCallback } from 'react';
import '../styles/quota-management.css';

interface QuotaManagementProps {
  clientId: string;
  onQuotaUpdate?: (newQuota: number) => void;
}

interface ClientQuota {
  clientId: string;
  username: string;
  currentQuota: number;
  usedSMS: number;
  remainingSMS: number;
  monthlyAllocation: number;
  subscriptionPlan: string;
  planPrice: number;
  renewalDate: string;
  isActive: boolean;
  usageHistory: Array<{
    date: string;
    sent: number;
    remaining: number;
  }>;
  alerts: Array<{
    type: string;
    message: string;
    date: string;
  }>;
}

export default function QuotaManagement({ clientId, onQuotaUpdate }: QuotaManagementProps) {
  const [quotaData, setQuotaData] = useState<ClientQuota | null>(null);
  const [loading, setLoading] = useState(false);
  const [allocateAmount, setAllocateAmount] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const plans = [
    { name: 'Starter', quota: 200, price: 5000 },
    { name: 'Pro', quota: 500, price: 12000 },
    { name: 'Enterprise', quota: 1000, price: 25000 },
    { name: 'Premium', quota: 2000, price: 45000 }
  ];

  const loadQuotaData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/quota?clientId=${clientId}`);
      const result = await response.json();
      
      if (result.success) {
        setQuotaData(result.data);
        setSelectedPlan(result.data.subscriptionPlan);
      }
    } catch (error) {
      console.error('Erreur chargement quota:', error);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadQuotaData();
  }, [loadQuotaData]);

  const handleAllocateQuota = async () => {
    if (allocateAmount <= 0) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'allocate',
          clientId,
          amount: allocateAmount
        })
      });

      const result = await response.json();
      if (result.success) {
        await loadQuotaData();
        setAllocateAmount(0);
        onQuotaUpdate?.(result.newQuota);
        alert('Quota alloué avec succès!');
      }
    } catch (error) {
      console.error('Erreur allocation:', error);
      alert('Erreur lors de l\'allocation');
    } finally {
      setLoading(false);
    }
  };

  const handleResetQuota = async () => {
    if (!confirm('Confirmer la réinitialisation du quota?')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          clientId
        })
      });

      const result = await response.json();
      if (result.success) {
        await loadQuotaData();
        alert('Quota réinitialisé!');
      }
    } catch (error) {
      console.error('Erreur reset:', error);
      alert('Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async () => {
    if (selectedPlan === quotaData?.subscriptionPlan) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_plan',
          clientId,
          plan: selectedPlan
        })
      });

      const result = await response.json();
      if (result.success) {
        await loadQuotaData();
        alert(`Plan mis à jour vers ${selectedPlan}!`);
      }
    } catch (error) {
      console.error('Erreur update plan:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !quotaData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="quota-spinner"></div>
        <span className="ml-2">Chargement des données quota...</span>
      </div>
    );
  }

  if (!quotaData) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Impossible de charger les données du client</p>
      </div>
    );
  }

  const usagePercentage = (quotaData.usedSMS / quotaData.currentQuota) * 100;
  const isLowQuota = quotaData.remainingSMS < (quotaData.currentQuota * 0.2);

  return (
    <div className="space-y-6">
      {/* En-tête avec informations principales */}
      <div className="quota-card">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">{quotaData.username}</h3>
            <p className="text-gray-600">Plan: {quotaData.subscriptionPlan}</p>
            <p className="text-gray-600">Renouvellement: {new Date(quotaData.renewalDate).toLocaleDateString()}</p>
          </div>
          <div className={`quota-status-badge ${quotaData.isActive ? 'active' : 'inactive'}`}>
            {quotaData.isActive ? 'Actif' : 'Inactif'}
          </div>
        </div>

        {/* Barre de progression du quota */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Utilisation SMS</span>
            <span>{quotaData.usedSMS} / {quotaData.currentQuota}</span>
          </div>
          <div className="quota-progress-bar">
            <div 
              className={`quota-progress-fill ${
                isLowQuota ? 'low' : usagePercentage > 70 ? 'medium' : 'good'
              }`}
              ref={(el) => {
                if (el) {
                  el.style.width = `${Math.min(usagePercentage, 100)}%`;
                }
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>{quotaData.remainingSMS} restants</span>
            <span>{quotaData.currentQuota}</span>
          </div>
        </div>

        {/* Alertes */}
        {quotaData.alerts.length > 0 && (
          <div className="mb-4">
            {quotaData.alerts.map((alert, index) => (
              <div key={index} className={`quota-alert ${alert.type}`}>
                <p className="text-sm">{alert.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions de gestion */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Allocation de quota */}
        <div className="quota-card">
          <h4 className="text-lg font-semibold mb-4">Allouer des SMS</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre de SMS à allouer</label>
              <input
                type="number"
                value={allocateAmount}
                onChange={(e) => setAllocateAmount(parseInt(e.target.value) || 0)}
                className="quota-form-input"
                placeholder="Ex: 100"
                min="1"
              />
            </div>
            <button
              onClick={handleAllocateQuota}
              disabled={loading || allocateAmount <= 0}
              className="w-full quota-btn primary"
            >
              {loading ? 'Allocation...' : 'Allouer SMS'}
            </button>
          </div>
        </div>

        {/* Changement de plan */}
        <div className="quota-card">
          <h4 className="text-lg font-semibold mb-4">Modifier le plan</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Plan d'abonnement</label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                title="Sélectionner un plan d'abonnement"
                className="quota-form-input"
              >
                {plans.map(plan => (
                  <option key={plan.name} value={plan.name}>
                    {plan.name} - {plan.quota} SMS - {plan.price.toLocaleString()} FCFA
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleUpdatePlan}
              disabled={loading || selectedPlan === quotaData.subscriptionPlan}
              className="w-full quota-btn success"
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour le plan'}
            </button>
          </div>
        </div>
      </div>

      {/* Actions supplémentaires */}
      <div className="quota-card">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleResetQuota}
            disabled={loading}
            className="quota-btn warning"
          >
            Réinitialiser quota
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="quota-btn secondary"
          >
            {showHistory ? 'Masquer' : 'Voir'} l'historique
          </button>
        </div>
      </div>

      {/* Historique d'utilisation */}
      {showHistory && (
        <div className="quota-card">
          <h4 className="text-lg font-semibold mb-4">Historique d'utilisation</h4>
          <div className="overflow-x-auto">
            <table className="quota-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>SMS envoyés</th>
                  <th>Restants</th>
                </tr>
              </thead>
              <tbody>
                {quotaData.usageHistory.slice(-10).map((entry, index) => (
                  <tr key={index}>
                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                    <td>{entry.sent}</td>
                    <td>{entry.remaining}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
