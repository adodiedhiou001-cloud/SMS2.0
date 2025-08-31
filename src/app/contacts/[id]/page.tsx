'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, User, Phone, Mail, Building2, MapPin, Calendar, Tag, FileText, Edit, Trash2 } from 'lucide-react'
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
}

const ContactDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const contactId = params.id as string

  const [loading, setLoading] = useState(true)
  const [contact, setContact] = useState<Contact | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];

        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/contacts/${contactId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        
        if (!response.ok) {
          throw new Error('Contact non trouvé')
        }
        const contactData = await response.json()
        setContact(contactData.data || contactData)
      } catch (error) {
        console.error('Erreur lors du chargement du contact:', error)
        toast.error('Impossible de charger le contact')
        router.push('/contacts')
      } finally {
        setLoading(false)
      }
    }

    if (contactId) {
      fetchContact()
    }
  }, [contactId, router])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      toast.success('Contact supprimé avec succès')
      router.push('/contacts')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression du contact')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPhoneDisplay = (phone: string) => {
    return phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/contacts')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour aux contacts
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 bg-primary-100 rounded-lg flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  {contact.firstName} {contact.lastName}
                </h1>
                {contact.company && (
                  <p className="text-lg text-gray-600 mt-1">{contact.company}</p>
                )}
                {contact.tags && contact.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {contact.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/contacts/${contactId}/edit`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Phone className="mr-2 h-5 w-5 text-gray-400" />
                Coordonnées
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">
                    {formatPhoneDisplay(contact.phone)}
                  </dd>
                </div>
                {contact.email && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-primary-600 hover:text-primary-500"
                      >
                        {contact.email}
                      </a>
                    </dd>
                  </div>
                )}
                {contact.address && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-start">
                      <MapPin className="mr-2 h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      {contact.address}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {contact.notes && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-gray-400" />
                  Notes
                </h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {contact.notes}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                Informations
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Créé le</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(contact.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Modifié le</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(contact.updatedAt)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 border border-primary-300 rounded-md shadow-sm text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100">
                  <Phone className="mr-2 h-4 w-4" />
                  Envoyer un SMS
                </button>
                {contact.email && (
                  <button
                    onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Envoyer un email
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Supprimer le contact
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Êtes-vous sûr de vouloir supprimer le contact{' '}
                  <span className="font-medium">
                    {contact.firstName} {contact.lastName}
                  </span>{' '}
                  ? Cette action est irréversible.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={deleting}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                        Suppression...
                      </>
                    ) : (
                      'Supprimer'
                    )}
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

export default ContactDetailPage
