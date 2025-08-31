import React, { useState, useEffect } from 'react';
import { ShoppingCart, CreditCard, Package, Globe, Calendar, DollarSign, RefreshCw, Filter } from 'lucide-react';

interface PurchaseOrder {
  id: string;
  developerId: string;
  contractId: string;
  country: string;
  offerName: string;
  bundleId: string;
  bundleDescription: string;
  price: number;
  currency: string;
  purchaseDate: string;
  paymentMode: string;
  paymentProviderOrderId: string | null;
  payerId: string;
  type: string;
  oldAvailableUnits: number;
  newAvailableUnits: number;
  oldExpirationDate: string;
  newExpirationDate: string;
}

interface PurchaseSummary {
  totalOrders: number;
  totalSpent: number;
  totalSMSPurchased: number;
  countrySummary: { [key: string]: { 
    orders: number; 
    spent: number; 
    sms: number; 
    currency: string;
  } };
  bundleSummary: { [key: string]: { 
    count: number; 
    totalPrice: number; 
    totalSMS: number;
    currency: string;
  } };
  paymentModeSummary: { [key: string]: number };
  averageOrderValue: number;
  averageSMSPerOrder: number;
}

interface PurchaseResponse {
  success: boolean;
  data: PurchaseOrder[];
  summary: PurchaseSummary;
  timestamp: string;
}

const OrangePurchaseHistoryAdmin: React.FC = () => {
  const [purchases, setPurchases] = useState<PurchaseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchPurchaseHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = countryFilter 
        ? `/api/admin/orange-purchases?country=${countryFilter}`
        : '/api/admin/orange-purchases';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setPurchases(data);
      } else {
        setError(data.message || 'Erreur lors de la récupération de l\'historique');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseHistory();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPurchaseHistory();
  };

  const clearFilters = () => {
    setCountryFilter('');
  };

  const getCountryName = (code: string) => {
    const countries: { [key: string]: string } = {
      'SEN': 'Sénégal',
      'CIV': 'Côte d\'Ivoire',
      'CMR': 'Cameroun',
      'MLI': 'Mali',
      'BFA': 'Burkina Faso',
      'NER': 'Niger',
      'GIN': 'Guinée',
      'MDG': 'Madagascar',
      'CAF': 'République Centrafricaine',
      'TCD': 'Tchad'
    };
    return countries[code] || code;
  };

  const getPaymentModeLabel = (mode: string) => {
    const modes: { [key: string]: string } = {
      'OTP_SMS_OCB': 'SMS OTP',
      'NOCHALLENGE_OM': 'Orange Money',
      'CARD': 'Carte bancaire',
      'CREDIT': 'Crédit'
    };
    return modes[mode] || mode;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  if (loading && !purchases) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Chargement de l'historique...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold">Historique des Achats Orange</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
            <button
              onClick={fetchPurchaseHistory}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Filtres */}
        {showFilters && (
          <form onSubmit={handleFilterSubmit} className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrer par pays (ex: SEN, CIV)
                </label>
                <input
                  type="text"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value.toUpperCase())}
                  placeholder="SEN"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Appliquer
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Effacer
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>

      {purchases && (
        <>
          {/* Résumé global */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                <span className="font-medium">Total Achats</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {purchases.summary.totalOrders}
              </p>
              <p className="text-sm text-gray-600">Commandes passées</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Montant Total</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {purchases.summary.totalSpent.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">FCFA dépensés</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="w-5 h-5 text-orange-600" />
                <span className="font-medium">SMS Achetés</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {purchases.summary.totalSMSPurchased.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Messages au total</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Valeur Moyenne</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(purchases.summary.averageOrderValue).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">FCFA par achat</p>
            </div>
          </div>

          {/* Résumé par pays */}
          {Object.keys(purchases.summary.countrySummary).length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Globe className="w-5 h-5 text-orange-600 mr-2" />
                Achats par pays
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Pays</th>
                      <th className="text-right py-2 px-4">Commandes</th>
                      <th className="text-right py-2 px-4">Montant</th>
                      <th className="text-right py-2 px-4">SMS</th>
                      <th className="text-right py-2 px-4">Moy./Commande</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(purchases.summary.countrySummary)
                      .sort(([,a], [,b]) => b.spent - a.spent)
                      .map(([country, stats]) => (
                      <tr key={country} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium">
                          {getCountryName(country)} ({country})
                        </td>
                        <td className="text-right py-2 px-4">
                          {stats.orders}
                        </td>
                        <td className="text-right py-2 px-4">
                          {formatCurrency(stats.spent, stats.currency)}
                        </td>
                        <td className="text-right py-2 px-4">
                          {stats.sms.toLocaleString()}
                        </td>
                        <td className="text-right py-2 px-4">
                          {formatCurrency(Math.round(stats.spent / stats.orders), stats.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Historique détaillé */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 text-purple-600 mr-2" />
              Historique détaillé ({purchases.data.length} achats)
            </h3>
            <div className="space-y-4">
              {purchases.data.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-orange-600" />
                          <span className="font-medium text-gray-900">
                            {order.bundleDescription}
                          </span>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {getCountryName(order.country)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Date:</span>
                          <br />
                          {new Date(order.purchaseDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Prix:</span>
                          <br />
                          {formatCurrency(order.price, order.currency)}
                        </div>
                        <div>
                          <span className="font-medium">SMS ajoutés:</span>
                          <br />
                          +{(order.newAvailableUnits - order.oldAvailableUnits).toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Paiement:</span>
                          <br />
                          {getPaymentModeLabel(order.paymentMode)}
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-gray-500">
                        <span>ID: {order.id}</span>
                        {order.paymentProviderOrderId && (
                          <span className="ml-4">Réf. paiement: {order.paymentProviderOrderId}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(order.price, order.currency)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {(order.newAvailableUnits - order.oldAvailableUnits)} SMS
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Informations de mise à jour */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Dernière mise à jour: {new Date(purchases.timestamp).toLocaleString()}
              {' • '}
              {purchases.data.length} achat(s) trouvé(s)
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default OrangePurchaseHistoryAdmin;
