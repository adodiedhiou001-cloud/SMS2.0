import React, { useState, useEffect } from 'react';
import { BarChart3, Globe, Smartphone, TrendingUp, Filter, RefreshCw } from 'lucide-react';

interface CountryStatistics {
  appid: string;
  usage: number;
  nbEnforcements: number;
}

interface ServiceStatistics {
  country: string;
  countryStatistics: CountryStatistics[];
}

interface Statistics {
  service: string;
  serviceStatistics: ServiceStatistics[];
}

interface OrangeStatisticsData {
  partnerStatistics: {
    developerId: string;
    statistics: Statistics[];
  };
}

interface StatisticsSummary {
  totalUsage: number;
  totalEnforcements: number;
  countrySummary: { [key: string]: { usage: number; enforcements: number } };
  appSummary: { [key: string]: { usage: number; enforcements: number } };
  developerId: string;
}

interface StatisticsResponse {
  success: boolean;
  data: OrangeStatisticsData;
  summary: StatisticsSummary;
  timestamp: string;
}

const OrangeStatisticsAdmin: React.FC = () => {
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    country: '',
    appId: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters.country) params.append('country', filters.country);
      if (filters.appId) params.append('appid', filters.appId);
      
      const url = `/api/admin/orange-statistics${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setStatistics(data);
      } else {
        setError(data.message || 'Erreur lors de la récupération des statistiques');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatistics();
  };

  const clearFilters = () => {
    setFilters({ country: '', appId: '' });
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

  if (loading && !statistics) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Chargement des statistiques...</span>
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
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold">Statistiques SMS Orange</h2>
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
              onClick={fetchStatistics}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Filtres */}
        {showFilters && (
          <form onSubmit={handleFilterSubmit} className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code pays (ex: SEN, CIV)
                </label>
                <input
                  type="text"
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value.toUpperCase() })}
                  placeholder="SEN"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Application
                </label>
                <input
                  type="text"
                  value={filters.appId}
                  onChange={(e) => setFilters({ ...filters, appId: e.target.value })}
                  placeholder="yf1qyS4gv****"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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

      {statistics && (
        <>
          {/* Résumé global */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium">Total SMS</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {statistics.summary.totalUsage.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Messages envoyés</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Enforcements</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {statistics.summary.totalEnforcements.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Contrôles effectués</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <Globe className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Pays</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {Object.keys(statistics.summary.countrySummary).length}
              </p>
              <p className="text-sm text-gray-600">Pays couverts</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <Smartphone className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Applications</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {Object.keys(statistics.summary.appSummary).length}
              </p>
              <p className="text-sm text-gray-600">Apps actives</p>
            </div>
          </div>

          {/* Statistiques par pays */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Globe className="w-5 h-5 text-orange-600 mr-2" />
              Statistiques par pays
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Pays</th>
                    <th className="text-right py-2 px-4">SMS envoyés</th>
                    <th className="text-right py-2 px-4">Enforcements</th>
                    <th className="text-right py-2 px-4">Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(statistics.summary.countrySummary)
                    .sort(([,a], [,b]) => b.usage - a.usage)
                    .map(([country, stats]) => (
                    <tr key={country} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 font-medium">
                        {getCountryName(country)} ({country})
                      </td>
                      <td className="text-right py-2 px-4">
                        {stats.usage.toLocaleString()}
                      </td>
                      <td className="text-right py-2 px-4">
                        {stats.enforcements.toLocaleString()}
                      </td>
                      <td className="text-right py-2 px-4">
                        {stats.usage > 0 ? (stats.enforcements / stats.usage * 100).toFixed(1) + '%' : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statistiques par application */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Smartphone className="w-5 h-5 text-purple-600 mr-2" />
              Statistiques par application
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">ID Application</th>
                    <th className="text-right py-2 px-4">SMS envoyés</th>
                    <th className="text-right py-2 px-4">Enforcements</th>
                    <th className="text-right py-2 px-4">Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(statistics.summary.appSummary)
                    .sort(([,a], [,b]) => b.usage - a.usage)
                    .map(([appId, stats]) => (
                    <tr key={appId} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 font-mono text-sm">
                        {appId}
                      </td>
                      <td className="text-right py-2 px-4">
                        {stats.usage.toLocaleString()}
                      </td>
                      <td className="text-right py-2 px-4">
                        {stats.enforcements.toLocaleString()}
                      </td>
                      <td className="text-right py-2 px-4">
                        {stats.usage > 0 ? (stats.enforcements / stats.usage * 100).toFixed(1) + '%' : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Informations développeur */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Developer ID: <span className="font-mono">{statistics.summary.developerId}</span>
              {' • '}
              Dernière mise à jour: {new Date(statistics.timestamp).toLocaleString()}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default OrangeStatisticsAdmin;
