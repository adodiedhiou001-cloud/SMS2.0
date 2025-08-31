'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import './groups.css'

interface ContactGroup {
  id: string
  name: string
  description: string
  color: string
  icon: string
  contactCount: number
  createdAt: string
  updatedAt: string
}

const GroupsPage = () => {
  const router = useRouter()
  const [groups, setGroups] = useState<ContactGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<ContactGroup | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'Users'
  })

  const iconOptions = [
    { value: 'Users', label: '👥 Utilisateurs', icon: '👥' },
    { value: 'Star', label: '⭐ Étoile', icon: '⭐' },
    { value: 'Target', label: '🎯 Cible', icon: '🎯' },
    { value: 'Heart', label: '❤️ Cœur', icon: '❤️' },
    { value: 'Crown', label: '👑 Couronne', icon: '👑' },
    { value: 'Shield', label: '🛡️ Bouclier', icon: '🛡️' },
    { value: 'Building', label: '🏢 Entreprise', icon: '🏢' },
    { value: 'Phone', label: '📞 Téléphone', icon: '📞' },
    { value: 'Mail', label: '✉️ Email', icon: '✉️' },
    { value: 'Globe', label: '🌍 Globe', icon: '🌍' }
  ]

  const colorOptions = [
    '#3B82F6', // Bleu
    '#10B981', // Vert
    '#F59E0B', // Orange
    '#EF4444', // Rouge
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange foncé
    '#EC4899', // Rose
    '#6B7280'  // Gris
  ]

  const fetchGroups = useCallback(async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/groups', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Le nom du groupe est requis')
      return
    }

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Groupe créé avec succès')
        setShowCreateModal(false)
        setFormData({ name: '', description: '', color: '#3B82F6', icon: 'Users' })
        fetchGroups()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de la création du groupe')
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      toast.error('Erreur lors de la création du groupe')
    }
  }

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/groups/${selectedGroup.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success('Groupe supprimé avec succès')
        setShowDeleteModal(false)
        setSelectedGroup(null)
        fetchGroups()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur lors de la suppression du groupe')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression du groupe')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des groupes...</p>
        </div>
      </div>
    )
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
                className="text-primary-600 font-medium"
              >
                Groupes
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

      <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Groupes de contacts</h1>
            <p className="mt-2 text-gray-600">
              Organisez vos contacts en créant vos propres groupes personnalisés
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              Créer un groupe
            </button>
          </div>
        </div>

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun groupe</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer votre premier groupe pour organiser vos contacts.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer un groupe
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div 
                      className="group-icon flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center text-white text-lg"
                      ref={(el) => {
                        if (el) {
                          el.style.setProperty('--group-color', group.color);
                        }
                      }}
                      aria-label={`Groupe ${group.name}`}
                    >
                      {iconOptions.find(opt => opt.value === group.icon)?.icon || '👥'}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-500">{group.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedGroup(group)
                          setFormData({
                            name: group.name,
                            description: group.description,
                            color: group.color,
                            icon: group.icon
                          })
                          setShowCreateModal(true)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Modifier le groupe"
                        aria-label="Modifier le groupe"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedGroup(group)
                          setShowDeleteModal(true)
                        }}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Supprimer le groupe"
                        aria-label="Supprimer le groupe"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {group.contactCount} contact{group.contactCount !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => router.push(`/contacts?group=${group.id}`)}
                      className="text-sm text-primary-600 hover:text-primary-900"
                    >
                      Voir les contacts
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedGroup ? 'Modifier le groupe' : 'Créer un nouveau groupe'}
                </h3>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du groupe *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="ex: Clients VIP, Prospects..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Description du groupe (optionnel)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icône
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {iconOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, icon: option.value }))}
                          className={`p-2 text-lg rounded border-2 hover:border-primary-300 ${
                            formData.icon === option.value 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-gray-200'
                          }`}
                        >
                          {option.icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                          className={`color-picker-button w-8 h-8 rounded-full border-2 ${
                            formData.color === color ? 'border-gray-800' : 'border-gray-300'
                          }`}
                          ref={(el) => {
                            if (el) {
                              el.style.setProperty('--picker-color', color);
                            }
                          }}
                          title={`Couleur ${color}`}
                          aria-label={`Sélectionner la couleur ${color}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false)
                        setSelectedGroup(null)
                        setFormData({ name: '', description: '', color: '#3B82F6', icon: 'Users' })
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      {selectedGroup ? 'Modifier' : 'Créer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedGroup && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Supprimer le groupe
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Êtes-vous sûr de vouloir supprimer le groupe "<strong>{selectedGroup.name}</strong>" ? 
                  Cette action est irréversible. Les contacts dans ce groupe ne seront pas supprimés.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false)
                      setSelectedGroup(null)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteGroup}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

export default GroupsPage
