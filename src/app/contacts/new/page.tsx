'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Phone, Mail, Building2, MapPin, Save, ArrowLeft, Users, Calendar } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ContactGroup {
  id: string
  name: string
  color: string
  icon: string
}

const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '')
  const formatted = cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  return formatted
}

const NewContactPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [groups, setGroups] = useState<ContactGroup[]>([])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    company: '',
    address: '',
    dateOfBirth: '',
    notes: '',
    tags: '',
    groupId: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (!token) return

      const response = await fetch('/api/contact-groups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const groupsData = await response.json()
        setGroups(groupsData)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des groupes:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.replace(/\s/g, ''),
          email: formData.email.trim() || undefined,
          groupId: formData.groupId || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'ajout du contact');
      }

      const data = await response.json();
      toast.success('Contact ajouté avec succès !');
      router.push('/contacts');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ajout du contact');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const formatPhoneNumber = (value: string) => {
    // Supprimer tous les caractères non numériques sauf le +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // Si ça commence par +33, laisser tel quel
    if (cleaned.startsWith('+33')) {
      return cleaned;
    }
    
    // Si ça commence par 0, remplacer par +33
    if (cleaned.startsWith('0')) {
      return '+33' + cleaned.substring(1);
    }
    
    // Si c'est juste des chiffres sans préfixe, ajouter +33
    if (cleaned.match(/^\d+$/)) {
      return '+33' + cleaned;
    }
    
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({
      ...formData,
      phone: formatted,
    });
  };

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
              <button
                onClick={() => router.push('/contacts')}
                className="text-gray-700 hover:text-primary-600"
              >
                Contacts
              </button>
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
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ajouter un nouveau contact</h1>
          <p className="mt-2 text-gray-600">
            Ajoutez un contact à votre carnet d'adresses pour l'inclure dans vos campagnes SMS.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nom */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Prénom *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: Jean"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Nom *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: Dupont"
              />
            </div>

            {/* Numéro de téléphone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Numéro de téléphone *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handlePhoneChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: +33612345678 ou 0612345678"
              />
              <p className="mt-1 text-sm text-gray-500">
                Le numéro sera automatiquement formaté au format international (+33...)
              </p>
            </div>

            {/* Email (optionnel) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email (optionnel)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: jean.dupont@email.com"
              />
            </div>

            {/* Date de naissance (optionnel) */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date de naissance (optionnel)
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                max={new Date().toISOString().split('T')[0]}
              />
              <p className="mt-1 text-sm text-gray-500">
                Utile pour les campagnes d'anniversaire ou le ciblage par âge
              </p>
            </div>

            {/* Groupe de contact */}
            <div>
              <label htmlFor="groupId" className="block text-sm font-medium text-gray-700">
                <Users className="inline h-4 w-4 mr-1" />
                Groupe de contact
              </label>
              <select
                id="groupId"
                name="groupId"
                value={formData.groupId}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Aucun groupe</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Assignez ce contact à un groupe pour faciliter le ciblage des campagnes.
                {groups.length === 0 && (
                  <span>
                    {' '}
                    <button
                      type="button"
                      onClick={() => router.push('/groups')}
                      className="text-primary-600 hover:text-primary-700 underline"
                    >
                      Créer votre premier groupe
                    </button>
                  </span>
                )}
              </p>
            </div>

            {/* Aperçu */}
            {(formData.firstName || formData.lastName || formData.phone) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Aperçu du contact:</h3>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-sm">
                        {((formData.firstName && formData.firstName[0]) || '') + ((formData.lastName && formData.lastName[0]) || '') || '?'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{`${formData.firstName} ${formData.lastName}`.trim() || 'Nom du contact'}</p>
                        {formData.groupId && groups.find(g => g.id === formData.groupId) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {groups.find(g => g.id === formData.groupId)?.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{formData.phone || 'Numéro de téléphone'}</p>
                      {formData.email && (
                        <p className="text-sm text-gray-500">{formData.email}</p>
                      )}
                      {formData.dateOfBirth && (
                        <p className="text-sm text-gray-500">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          {new Date(formData.dateOfBirth).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.push('/contacts')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Ajout...' : 'Ajouter le contact'}
              </button>
            </div>
          </form>
        </div>

        {/* Aide */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Conseils</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Assurez-vous que le numéro de téléphone est correct pour éviter les échecs d'envoi</li>
            <li>• L'email est optionnel mais peut être utile pour des statistiques avancées</li>
            <li>• Vous pourrez modifier ou supprimer ce contact plus tard</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default NewContactPage;
