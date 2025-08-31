'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface NavigationProps {
  currentPage?: 'dashboard' | 'contacts' | 'groups' | 'campaigns' | 'templates'
}

const Navigation: React.FC<NavigationProps> = ({ currentPage }) => {
  const router = useRouter()

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { key: 'contacts', label: 'Contacts', path: '/contacts' },
    { key: 'groups', label: 'Groupes', path: '/groups' },
    { key: 'templates', label: 'Templates', path: '/templates' },
    { key: 'campaigns', label: 'Campagnes', path: '/campaigns' },
  ]

  return (
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
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => router.push(item.path)}
                className={`transition-colors ${
                  currentPage === item.key
                    ? 'text-primary-600 font-medium'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
