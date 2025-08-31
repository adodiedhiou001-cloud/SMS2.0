'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { User, Phone, Mail, Building2, MapPin, Pencil, ArrowLeft, Save, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Contact {
  id: string
  firstName: string
  lastName: string
  phone: string
  email?: string
  company?: string
  address?: string
  tags?: string[]
  notes?: string
  createdAt: string
  updatedAt: string
  group?: {
    id: string
    name: string
    color: string
    icon: string
  }
}

interface ContactGroup {
  id: string
  name: string
  color: string
  icon: string
  contactCount: number
}

const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '')
  const formatted = cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  return formatted
}

const EditContactPage = () => {
  const params = useParams()
  const router = useRouter()
  const contactId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [contact, setContact] = useState<Contact | null>(null)
  const [groups, setGroups] = useState<ContactGroup[]>([])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    company: '',
    address: '',
    notes: '',
    tags: '',
    groupId: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];

        if (!token) {
          router.push('/login');
          return;
        }

        // Charger le contact et les groupes en parallèle
        const [contactResponse, groupsResponse] = await Promise.all([
          fetch(`/api/contacts/${contactId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }),
          fetch('/api/groups', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
        ])
        
        if (!contactResponse.ok) {
          throw new Error('Contact non trouvé')
        }
        
        const contactData = await contactResponse.json()
        setContact(contactData.data || contactData)
        setFormData({
          firstName: (contactData.data || contactData).firstName || '',
          lastName: (contactData.data || contactData).lastName || '',
          phone: (contactData.data || contactData).phone || '',
          email: (contactData.data || contactData).email || '',
          company: (contactData.data || contactData).company || '',
          address: (contactData.data || contactData).address || '',
          notes: (contactData.data || contactData).notes || '',
          tags: (contactData.data || contactData).tags ? (contactData.data || contactData).tags.join(', ') : '',
          groupId: (contactData.data || contactData).group?.id || ''
        })

        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json()
          setGroups(groupsData.groups || [])
        }
      } catch (error) {
        console.error('Erreur lors du chargement du contact:', error)
        toast.error('Impossible de charger le contact')
        router.push('/contacts')
      } finally {
        setLoading(false)
      }
    }

    if (contactId) {
      fetchData()
    }
  }, [contactId, router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis'
    } else {
      const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/
      const cleanPhone = formData.phone.replace(/\s/g, '')
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Format de téléphone invalide (ex: 06 12 34 56 78)'
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === 'phone') {
      value = formatPhoneNumber(value)
    }
    
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire')
      return
    }

    setSaving(true)

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const cleanPhone = formData.phone.replace(/\s/g, '')

      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: cleanPhone,
          email: formData.email.trim() || null,
          company: formData.company.trim() || null,
          address: formData.address.trim() || null,
          notes: formData.notes.trim() || null,
          tags: tagsArray.length > 0 ? tagsArray : null,
          groupId: formData.groupId || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la modification')
      }

      toast.success('Contact modifié avec succès')
      router.push('/contacts')
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la modification du contact')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du contact...</p>
        </div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact non trouvé</h2>
          <p className="text-gray-600 mb-4">Le contact que vous cherchez n'existe pas.</p>
          <button
            onClick={() => router.push('/contacts')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux contacts
          </button>
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
                className="text-primary-600 font-medium"
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/contacts')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour aux contacts
          </button>
          
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Pencil className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Modifier le contact</h1>
              <div className="flex items-center space-x-2">
                <p className="text-gray-600">
                  {contact.firstName} {contact.lastName}
                </p>
                {contact.group && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {contact.group.icon} {contact.group.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informations personnelles */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="mr-2 h-5 w-5 text-gray-400" />
                Informations personnelles
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Entrez le prénom"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Entrez le nom"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Coordonnées */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Phone className="mr-2 h-5 w-5 text-gray-400" />
                Coordonnées
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="06 12 34 56 78"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="contact@exemple.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Informations complémentaires */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Building2 className="mr-2 h-5 w-5 text-gray-400" />
                Informations complémentaires
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Groupe
                  </label>
                  <select
                    value={formData.groupId}
                    onChange={(e) => handleInputChange('groupId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    aria-label="Sélectionner un groupe de contacts"
                  >
                    <option value="">Aucun groupe</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.icon} {group.name} ({group.contactCount} contacts)
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Sélectionnez un groupe pour organiser vos contacts
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Nom de l'entreprise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Adresse complète"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="client, prospect, vip (séparés par des virgules)"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Séparez les tags par des virgules
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Notes additionnelles..."
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/contacts')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Modification...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Modifier le contact
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  )
}

export default EditContactPage
