'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Plus, Search, Filter, Users, Eye, Edit, Trash2, Grid3x3 } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  company?: string;
  group?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ContactGroup {
  id: string;
  name: string;
  color: string;
  icon: string;
  _count: {
    contacts: number;
  };
}

export default function ContactsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchContacts();
    fetchGroups();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchContacts();
    }
  }, [selectedGroup, isAuthenticated]);

  const fetchContacts = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      let url = '/api/contacts';
      if (selectedGroup !== 'all') {
        url += `?groupId=${selectedGroup}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) return;

      const response = await fetch('/api/contact-groups', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const groupsData = await response.json();
        setGroups(groupsData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des groupes:', error);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      return;
    }

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setContacts(contacts.filter(c => c.id !== contactId));
        toast.success('Contact supprimé avec succès');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phoneNumber.includes(searchTerm) ||
    (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">SMS Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-700 hover:text-primary-600"
              >
                Dashboard
              </button>
              <span className="text-primary-600 font-medium">Contacts</span>
              <button
                onClick={() => router.push('/campaigns')}
                className="text-gray-700 hover:text-primary-600"
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
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
              <p className="mt-2 text-gray-600">
                Gérez votre carnet d'adresses et organisez vos contacts.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/groups')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Grid3x3 className="mr-2 h-4 w-4" />
                Gérer les groupes
              </button>
              <Link
                href="/contacts/new"
                className="inline-flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouveau contact
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Group Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrer par groupe
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  aria-label="Filtrer par groupe"
                >
                  <option value="all">Tous les contacts</option>
                  <option value="no-group">Aucun groupe</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group._count.contacts})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nom, téléphone, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Actions */}
          {contacts.length > 0 && (
            <div className="bg-white shadow rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full sm:max-w-xs">
                  <input
                    type="text"
                    placeholder="Rechercher un contact..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {selectedContacts.length > 0 && `${selectedContacts.length} sélectionné(s) • `}
                    {filteredContacts.length} contact(s)
                  </span>
                  {selectedContacts.length > 0 && (
                    <button
                      onClick={() => {
                        // TODO: Créer une campagne avec les contacts sélectionnés
                        toast('Fonctionnalité à venir : Créer une campagne avec les contacts sélectionnés');
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Créer campagne
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contacts List */}
          {isLoading ? (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : contacts.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun contact</h3>
              <p className="text-gray-500 mb-6">
                Vous n'avez pas encore ajouté de contact. Commencez à construire votre carnet d'adresses !
              </p>
              <Link
                href="/contacts/new"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Ajouter mon premier contact
              </Link>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat</h3>
              <p className="text-gray-500 mb-6">
                Aucun contact ne correspond à votre recherche "{searchTerm}".
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-primary-600 hover:text-primary-700"
              >
                Effacer la recherche
              </button>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {/* Header avec sélection */}
              {contacts.length > 1 && (
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedContacts.length === filteredContacts.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Sélectionner tout ({filteredContacts.length})
                    </span>
                  </label>
                </div>
              )}

              <ul className="divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <li key={contact.id}>
                    <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center flex-1">
                        {/* Checkbox */}
                        {contacts.length > 1 && (
                          <div>
                            <label className="sr-only">Sélectionner ce contact</label>
                            <input
                              type="checkbox"
                              checked={selectedContacts.includes(contact.id)}
                              onChange={() => handleSelectContact(contact.id)}
                              className="mr-3 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              aria-label={`Sélectionner ${contact.name}`}
                            />
                          </div>
                        )}

                        {/* Avatar */}
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-primary-600 font-semibold text-sm">
                            {getInitials(contact.name)}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">
                              {contact.name}
                            </h3>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {contact.phoneNumber}
                            </span>
                            {contact.email && (
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {contact.email}
                              </span>
                            )}
                            <span>
                              Ajouté le {formatDate(contact.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/contacts/${contact.id}`)}
                          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => router.push(`/contacts/${contact.id}/edit`)}
                          className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
