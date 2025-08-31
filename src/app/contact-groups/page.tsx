/* eslint-disable react/forbid-dom-props */
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Users, Edit, Trash2, Palette, Grid3x3, Filter, Search, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'
import './contact-groups.css'

interface ContactGroup {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  _count: {
    contacts: number
  }
  createdAt: string
  updatedAt: string
}

interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  group?: {
    id: string
    name: string
    color: string
    icon: string
  }
}

const ContactGroupsPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<ContactGroup[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<ContactGroup | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'Users'
  })

  const iconOptions = [
    'Users', 'Heart', 'TrendingUp', 'Calendar', 'Flame', 'Clock', 
    'Crown', 'Handshake', 'Tool', 'Star', 'Target', 'Shield'
  ]

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ]

  // Helper pour convertir une couleur hex en RGB avec opacité
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // Composant pour afficher l'icône du groupe avec sa couleur
  const GroupIcon = ({ group }: { group: ContactGroup }) => (
    <div 
      className="group-icon-bg h-8 w-8 rounded-full flex items-center justify-center mr-3"
      ref={(el) => {
        if (el) {
          el.style.setProperty('--group-bg-color', hexToRgba(group.color, 0.2));
        }
      }}
    >
      <span 
        className="group-icon-text text-base"
        ref={(el) => {
          if (el) {
            el.style.setProperty('--group-color', group.color);
          }
        }}
      >
        {getIconComponent(group.icon)}
      </span>
    </div>
  )

  // Composant pour les boutons de couleur
  const ColorButton = ({ color, isSelected, onClick, title }: { 
    color: string, 
    isSelected: boolean, 
    onClick: () => void,
    title: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`color-picker-dot w-8 h-8 rounded-full border-2 ${
        isSelected ? 'border-gray-800' : 'border-gray-300'
      }`}
      ref={(el) => {
        if (el) {
          el.style.setProperty('--picker-color', color);
        }
      }}
    />
  )

  const fetchGroups = useCallback(async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/contact-groups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des groupes')
      }

      const groupsData = await response.json()
      setGroups(groupsData)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger les groupes')
    }
  }, [router])

  const fetchContacts = useCallback(async (groupId?: string) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (!token) return

      let url = '/api/contacts'
      if (groupId) {
        url += `?groupId=${groupId}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des contacts')
      }

      const contactsData = await response.json()
      setContacts(contactsData)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger les contacts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGroups()
    fetchContacts()
  }, [fetchGroups, fetchContacts])

  const initializeDefaultGroups = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      const response = await fetch('/api/contact-groups/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'initialisation')
      }

      const result = await response.json()
      toast.success(result.message)
      await fetchGroups()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'initialisation des groupes')
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      const response = await fetch('/api/contact-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newGroup)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création')
      }

      toast.success('Groupe créé avec succès')
      setShowCreateModal(false)
      setNewGroup({ name: '', description: '', color: '#3B82F6', icon: 'Users' })
      await fetchGroups()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création du groupe')
    }
  }

  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingGroup) return

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      const response = await fetch(`/api/contact-groups/${editingGroup.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingGroup.name,
          description: editingGroup.description,
          color: editingGroup.color,
          icon: editingGroup.icon
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la modification')
      }

      toast.success('Groupe modifié avec succès')
      setShowEditModal(false)
      setEditingGroup(null)
      await fetchGroups()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la modification du groupe')
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe ? Les contacts seront déplacés vers "Aucun groupe".')) {
      return
    }

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      const response = await fetch(`/api/contact-groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      toast.success('Groupe supprimé avec succès')
      await fetchGroups()
      if (selectedGroup === groupId) {
        setSelectedGroup(null)
        fetchContacts()
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la suppression du groupe')
    }
  }

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      Users, Heart: '❤️', TrendingUp: '📈', Calendar: '📅', Flame: '🔥',
      Clock: '⏰', Crown: '👑', Handshake: '🤝', Tool: '🔧', Star: '⭐',
      Target: '🎯', Shield: '🛡️'
    }
    return iconMap[iconName] || <Users className="h-4 w-4" />
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Groupes de contacts</h1>
              <p className="text-gray-600">Organisez vos contacts en groupes pour une meilleure gestion</p>
            </div>
            <div className="flex space-x-3">
              {groups.length === 0 && (
                <button
                  onClick={initializeDefaultGroups}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Grid3x3 className="mr-2 h-4 w-4" />
                  Créer groupes par défaut
                </button>
              )}
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouveau groupe
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des groupes */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Groupes disponibles</h2>
              
              {/* Aucun groupe */}
              <div
                onClick={() => {
                  setSelectedGroup(null)
                  fetchContacts()
                }}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer mb-2 ${
                  selectedGroup === null ? 'bg-primary-50 border-2 border-primary-200' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Aucun groupe</p>
                    <p className="text-sm text-gray-500">
                      {contacts.filter(c => !c.group).length} contact(s)
                    </p>
                  </div>
                </div>
              </div>

              {/* Groupes personnalisés */}
              {groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => {
                    setSelectedGroup(group.id)
                    fetchContacts(group.id)
                  }}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer mb-2 ${
                    selectedGroup === group.id ? 'bg-primary-50 border-2 border-primary-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <GroupIcon group={group} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{group.name}</p>
                      <p className="text-sm text-gray-500">
                        {group._count.contacts} contact(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingGroup(group)
                        setShowEditModal(true)
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Modifier le groupe"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteGroup(group.id)
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Supprimer le groupe"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contacts du groupe sélectionné */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    {selectedGroup 
                      ? groups.find(g => g.id === selectedGroup)?.name 
                      : 'Contacts sans groupe'
                    }
                  </h2>
                  <button
                    onClick={() => router.push('/contacts')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Voir tous les contacts
                  </button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher dans ce groupe..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="p-6">
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun contact</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedGroup 
                        ? 'Ce groupe ne contient pas encore de contacts.'
                        : 'Aucun contact sans groupe trouvé.'
                      }
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => router.push('/contacts/new')}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un contact
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-primary-600 font-semibold text-sm">
                              {contact.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{contact.name}</p>
                            <p className="text-sm text-gray-500">{contact.phone}</p>
                            {contact.email && (
                              <p className="text-sm text-gray-500">{contact.email}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => router.push(`/contacts/${contact.id}`)}
                          className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                        >
                          Voir détails
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Créer un nouveau groupe</h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du groupe *
                </label>
                <input
                  type="text"
                  required
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Ex: Clients fidèles"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  rows={2}
                  placeholder="Description optionnelle..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Couleur
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <ColorButton
                      key={color}
                      color={color}
                      isSelected={newGroup.color === color}
                      onClick={() => setNewGroup({ ...newGroup, color })}
                      title={`Sélectionner la couleur ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Créer le groupe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && editingGroup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Modifier le groupe</h3>
            <form onSubmit={handleEditGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du groupe *
                </label>
                <input
                  type="text"
                  required
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  title="Nom du groupe"
                  aria-label="Nom du groupe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingGroup.description || ''}
                  onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  rows={2}
                  title="Description du groupe"
                  aria-label="Description du groupe"
                  placeholder="Description optionnelle..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Couleur
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <ColorButton
                      key={color}
                      color={color}
                      isSelected={editingGroup.color === color}
                      onClick={() => setEditingGroup({ ...editingGroup, color })}
                      title={`Sélectionner la couleur ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingGroup(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Modifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactGroupsPage
