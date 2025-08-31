'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TagIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  SparklesIcon,
  GiftIcon,
  HeartIcon,
  MegaphoneIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const CATEGORY_ICONS = {
  bienvenue: UserGroupIcon,
  promotion: MegaphoneIcon,
  anniversaire: GiftIcon,
  fidelisation: HeartIcon,
  evenement: SparklesIcon,
  abandon_panier: ShoppingCartIcon,
  commande: ClipboardDocumentCheckIcon,
  service_client: ChatBubbleLeftRightIcon,
  general: TagIcon
};

const CATEGORY_COLORS = {
  bienvenue: 'bg-green-100 text-green-800',
  promotion: 'bg-red-100 text-red-800',
  anniversaire: 'bg-purple-100 text-purple-800',
  fidelisation: 'bg-pink-100 text-pink-800',
  evenement: 'bg-yellow-100 text-yellow-800',
  abandon_panier: 'bg-orange-100 text-orange-800',
  commande: 'bg-blue-100 text-blue-800',
  service_client: 'bg-indigo-100 text-indigo-800',
  general: 'bg-gray-100 text-gray-800'
};

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory, searchTerm]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        channel: 'sms',
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/templates?${params}`);
      const data = await response.json();

      if (response.ok) {
        setTemplates(data.templates);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPromoExpiry = (expiry) => {
    if (!expiry) return null;
    const date = new Date(expiry);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expiré';
    if (diffDays === 0) return 'Expire aujourd\'hui';
    if (diffDays === 1) return 'Expire demain';
    return `Expire dans ${diffDays} jours`;
  };

  const getCategoryIcon = (category) => {
    const IconComponent = CATEGORY_ICONS[category] || TagIcon;
    return <IconComponent className="h-4 w-4" />;
  };

  const replaceVariables = (content, variables) => {
    let result = content;
    variables.forEach(variable => {
      const regex = new RegExp(`\\[${variable}\\]`, 'g');
      result = result.replace(regex, `{${variable}}`);
    });
    return result;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
              >
                SMS Pro
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/contacts')}
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Contacts
              </button>
              <button
                onClick={() => router.push('/groups')}
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Groupes
              </button>
              <button
                onClick={() => router.push('/templates')}
                className="text-primary-600 font-medium"
              >
                Templates
              </button>
              <button
                onClick={() => router.push('/campaigns')}
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Campagnes
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            {/* En-tête */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Templates SMS</h1>
                <p className="text-gray-600">Gérez vos templates avec codes promo et variables</p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Nouveau template</span>
              </button>
            </div>

            {/* Filtres */}
            <div className="bg-white p-4 rounded-lg shadow space-y-4">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {/* Recherche */}
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher des templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Catégories */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name} ({cat.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Statistiques */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>Total: {templates.length} templates</span>
                <span>Système: {templates.filter(t => t.isSystem).length}</span>
                <span>Personnalisés: {templates.filter(t => !t.isSystem).length}</span>
                <span>Avec promo: {templates.filter(t => t.promoCode).length}</span>
              </div>
            </div>

            {/* Liste des templates */}
            <div className="bg-white rounded-lg shadow">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  Chargement des templates...
                </div>
              ) : templates.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Aucun template trouvé
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {templates.map((template) => (
                    <div key={template.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* En-tête du template */}
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {template.name}
                            </h3>
                            
                            {/* Badge catégorie */}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[template.category] || CATEGORY_COLORS.general}`}>
                              {getCategoryIcon(template.category)}
                              <span className="ml-1">{template.category}</span>
                            </span>

                            {/* Badge système */}
                            {template.isSystem && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Système
                              </span>
                            )}

                            {/* Badge promo */}
                            {template.promoCode && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <GiftIcon className="h-3 w-3 mr-1" />
                                {template.promoCode} (-{template.promoValue})
                              </span>
                            )}
                          </div>

                          {/* Contenu du template */}
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {template.content.substring(0, 150)}
                            {template.content.length > 150 && '...'}
                          </p>

                          {/* Variables et tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {template.variables && template.variables.length > 0 && (
                              <div className="flex items-center space-x-1 text-xs text-blue-600">
                                <span>Variables:</span>
                                {template.variables.slice(0, 3).map((variable, index) => (
                                  <span key={index} className="bg-blue-100 px-2 py-1 rounded">
                                    {variable}
                                  </span>
                                ))}
                                {template.variables.length > 3 && (
                                  <span className="text-gray-500">+{template.variables.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Informations promo */}
                          {template.promoCode && (
                            <div className="text-xs text-gray-500 flex items-center space-x-4">
                              <span>Code: <strong>{template.promoCode}</strong></span>
                              <span>Valeur: <strong>{template.promoValue}</strong></span>
                              {template.promoExpiry && (
                                <span className={`${
                                  formatPromoExpiry(template.promoExpiry) === 'Expiré' 
                                    ? 'text-red-600' 
                                    : formatPromoExpiry(template.promoExpiry)?.includes('aujourd\'hui') || formatPromoExpiry(template.promoExpiry)?.includes('demain')
                                      ? 'text-orange-600'
                                      : 'text-green-600'
                                }`}>
                                  {formatPromoExpiry(template.promoExpiry)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedTemplate(template);
                              setShowPreview(true);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                            title="Aperçu"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          
                          {!template.isSystem && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedTemplate(template);
                                  setShowCreateForm(true);
                                }}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full"
                                title="Modifier"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              
                              <button
                                onClick={() => {
                                  if (confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
                                    // TODO: Implement delete
                                  }
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                title="Supprimer"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Aperçu */}
            {showPreview && selectedTemplate && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Aperçu: {selectedTemplate.name}
                      </h3>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Contenu original:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedTemplate.content}</p>
                      </div>
                      
                      {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Avec variables remplacées:</h4>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {replaceVariables(selectedTemplate.content, selectedTemplate.variables)}
                          </p>
                        </div>
                      )}

                      {selectedTemplate.promoCode && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Informations promo:</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Code:</strong> {selectedTemplate.promoCode}
                            </div>
                            <div>
                              <strong>Valeur:</strong> {selectedTemplate.promoValue}
                            </div>
                            {selectedTemplate.promoExpiry && (
                              <div className="col-span-2">
                                <strong>Expiration:</strong> {formatPromoExpiry(selectedTemplate.promoExpiry)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}