'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import {
  TagIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  GiftIcon,
  EyeIcon,
  XMarkIcon,
  UserGroupIcon,
  MegaphoneIcon,
  HeartIcon,
  ShoppingCartIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface ContactGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  _count: {
    contacts: number;
  };
}

interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  channel: string;
  isSystem: boolean;
  variables: string[];
  promoCode?: string;
  promoValue?: string;
  promoExpiry?: string;
}

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

export default function NewCampaignPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [contactGroups, setContactGroups] = useState<ContactGroup[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    scheduledAt: '',
    targetGroups: [] as string[], // IDs des groupes sélectionnés
    targetType: 'groups' as 'all' | 'groups', // Cibler tous ou groupes spécifiques
  });
  
  // États pour les templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState('all');

  useEffect(() => {
    if (isAuthenticated) {
      fetchContactGroups();
    }
  }, [isAuthenticated]);

  // Gestion des touches clavier pour fermer les modales
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showTemplates) {
          setShowTemplates(false);
        }
      }
    };

    if (showTemplates) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus sur le premier élément de la modal
      const firstInput = document.querySelector('.template-modal input[type="text"]') as HTMLInputElement;
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showTemplates]);

  const fetchContactGroups = async () => {
    try {
      setLoadingGroups(true);
      const token = Cookies.get('token');
      
      const response = await fetch('/api/contacts/groups', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du chargement des groupes: ${response.status}`);
      }

      const data = await response.json();
      setContactGroups(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des groupes de contacts');
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const token = Cookies.get('token');
      
      const response = await fetch('/api/templates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des templates');
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des templates');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    // Appliquer le template au message
    setFormData(prev => ({
      ...prev,
      message: template.content
    }));
    setShowTemplates(false);
    toast.success(`Template "${template.name}" appliqué`);
  };

  const openTemplateSelector = () => {
    setShowTemplates(true);
    fetchTemplates();
  };

  // Debounce pour la recherche de templates
  useEffect(() => {
    const timer = setTimeout(() => {
      // Le filtrage se fait déjà automatiquement via filteredTemplates
    }, 300);

    return () => clearTimeout(timer);
  }, [templateSearch]);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
                         template.content.toLowerCase().includes(templateSearch.toLowerCase());
    const matchesCategory = templateCategory === 'all' || template.category === templateCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGroupToggle = (groupId: string) => {
    setFormData(prev => ({
      ...prev,
      targetGroups: prev.targetGroups.includes(groupId)
        ? prev.targetGroups.filter(id => id !== groupId)
        : [...prev.targetGroups, groupId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = Cookies.get('token');
      
      // Validation
      if (!formData.name.trim()) {
        toast.error('Le nom de la campagne est requis');
        return;
      }
      
      if (!formData.message.trim()) {
        toast.error('Le message est requis');
        return;
      }

      if (formData.targetType === 'groups' && formData.targetGroups.length === 0) {
        toast.error('Veuillez sélectionner au moins un groupe de contacts');
        return;
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la campagne');
      }

      toast.success('Campagne créée avec succès !');
      router.push('/campaigns');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création de la campagne');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la navigation retour avec confirmation si des modifications ont été faites
  const handleGoBack = () => {
    const hasChanges = formData.name || formData.message || formData.targetGroups.length > 0;
    
    if (hasChanges) {
      if (window.confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Entrée pour soumettre le formulaire
      if (event.ctrlKey && event.key === 'Enter' && !isLoading) {
        const form = document.querySelector('form');
        if (form) {
          form.requestSubmit();
        }
      }
      
      // Échap pour annuler
      if (event.key === 'Escape' && !showTemplates) {
        handleGoBack();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isLoading, showTemplates, formData]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nouvelle Campagne SMS</h1>
        <p className="mt-2 text-gray-600">
          Créez une nouvelle campagne SMS pour vos contacts
        </p>
        
        {/* Indicateur de progression */}
        <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500">
          <span>💡 Astuce:</span>
          <span>Utilisez <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+Entrée</kbd> pour soumettre rapidement</span>
          <span>•</span>
          <span><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Échap</kbd> pour annuler</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Informations générales
          </h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom de la campagne
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                autoComplete="off"
                autoFocus
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Ex: Promotion du mois"
              />
            </div>

            <div>
              <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700">
                Programmation (optionnel)
              </label>
              <input
                type="datetime-local"
                name="scheduledAt"
                id="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0, 16)} // Empêcher les dates passées
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.scheduledAt ? (
                  <>
                    📅 SMS programmé pour le {new Date(formData.scheduledAt).toLocaleDateString('fr-FR')} à {new Date(formData.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </>
                ) : (
                  'Laisser vide pour envoyer immédiatement'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Message
            </h2>
            <button
              type="button"
              onClick={openTemplateSelector}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              title="Utiliser un template"
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              Templates
            </button>
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Contenu du message
            </label>
            <textarea
              name="message"
              id="message"
              rows={4}
              value={formData.message}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                // Permet d'insérer des retours à la ligne avec Entrée
                // et de soumettre avec Ctrl+Entrée
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  const form = e.currentTarget.closest('form');
                  if (form) {
                    form.requestSubmit();
                  }
                }
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-vertical"
              placeholder="Rédigez votre message SMS ici..."
            />
            <p className="mt-2 text-sm text-gray-500">
              Longueur: {formData.message.length} caractères
              {formData.message.length > 160 && (
                <span className="text-orange-600 ml-2">
                  (Le message peut être divisé en {Math.ceil(formData.message.length / 160)} SMS)
                </span>
              )}
              {formData.message.length === 0 && (
                <span className="text-gray-400 ml-2">
                  • Appuyez sur <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+Entrée</kbd> dans le champ pour soumettre
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Ciblage */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Ciblage des contacts
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Type de ciblage
              </label>
              <div className="mt-2 space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="targetType"
                    value="all"
                    checked={formData.targetType === 'all'}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetType: e.target.value as 'all' | 'groups' }))}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Tous les contacts</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="targetType"
                    value="groups"
                    checked={formData.targetType === 'groups'}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetType: e.target.value as 'all' | 'groups' }))}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Groupes spécifiques</span>
                </label>
              </div>
            </div>

            {formData.targetType === 'groups' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sélectionner les groupes
                </label>
                {loadingGroups ? (
                  <p className="text-sm text-gray-500">Chargement des groupes...</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {contactGroups.map((group) => (
                      <label
                        key={group.id}
                        className="relative flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            checked={formData.targetGroups.includes(group.id)}
                            onChange={() => handleGroupToggle(group.id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <span className="font-medium text-gray-900">{group.name}</span>
                          {group.description && (
                            <p className="text-gray-500">{group.description}</p>
                          )}
                          <p className="text-gray-400 text-xs">
                            {group._count.contacts} contact{group._count.contacts > 1 ? 's' : ''}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Raccourci: Ctrl+Entrée"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Création...
              </>
            ) : (
              <>
                {formData.scheduledAt ? (
                  <>
                    📅 Programmer la campagne
                  </>
                ) : (
                  <>
                    📱 Créer et envoyer maintenant
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal Template Selector */}
      {showTemplates && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 template-modal"
          onClick={(e) => {
            // Fermer la modal si on clique à l'extérieur
            if (e.target === e.currentTarget) {
              setShowTemplates(false);
            }
          }}
        >
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Choisir un template
              </h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                title="Fermer (Échap)"
                autoFocus
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Filtres */}
            <div className="mb-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="Rechercher un template..."
                    autoComplete="off"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        // Focus sur le premier template
                        const firstTemplate = document.querySelector('.template-item') as HTMLElement;
                        if (firstTemplate) {
                          firstTemplate.focus();
                        }
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <select
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  title="Filtrer par catégorie"
                >
                  <option value="all">Toutes les catégories</option>
                  <option value="bienvenue">Bienvenue</option>
                  <option value="promotion">Promotion</option>
                  <option value="anniversaire">Anniversaire</option>
                  <option value="fidelisation">Fidélisation</option>
                  <option value="evenement">Événement</option>
                  <option value="abandon_panier">Abandon panier</option>
                  <option value="commande">Commande</option>
                  <option value="service_client">Service client</option>
                  <option value="general">Général</option>
                </select>
              </div>
            </div>

            {/* Liste des templates */}
            <div className="max-h-96 overflow-y-auto">
              {loadingTemplates ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Chargement des templates...</p>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun template trouvé</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredTemplates.map((template, index) => {
                    const IconComponent = CATEGORY_ICONS[template.category as keyof typeof CATEGORY_ICONS] || TagIcon;
                    return (
                      <div
                        key={template.id}
                        tabIndex={0}
                        className="template-item border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        onClick={() => handleTemplateSelect(template)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleTemplateSelect(template);
                          } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            const nextTemplate = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextTemplate) {
                              nextTemplate.focus();
                            }
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            const prevTemplate = e.currentTarget.previousElementSibling as HTMLElement;
                            if (prevTemplate) {
                              prevTemplate.focus();
                            } else {
                              // Retour à la recherche
                              const searchInput = document.querySelector('.template-modal input[type="text"]') as HTMLInputElement;
                              if (searchInput) {
                                searchInput.focus();
                              }
                            }
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <IconComponent className="h-5 w-5 text-gray-600" />
                              <h4 className="font-medium text-gray-900">{template.name}</h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[template.category as keyof typeof CATEGORY_COLORS] || 'bg-gray-100 text-gray-800'}`}>
                                {template.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{template.content}</p>
                            {template.promoCode && (
                              <div className="flex items-center gap-2 text-sm">
                                <GiftIcon className="h-4 w-4 text-green-600" />
                                <span className="text-green-600">
                                  Code: {template.promoCode} - {template.promoValue}
                                </span>
                              </div>
                            )}
                            {template.variables.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs text-gray-500">Variables: </span>
                                {template.variables.map((variable, index) => (
                                  <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                                    {variable}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
