'use client'

import React from 'react'
import Navigation from './Navigation'

interface PageLayoutProps {
  children: React.ReactNode
  currentPage?: 'dashboard' | 'contacts' | 'groups' | 'campaigns'
  className?: string
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  currentPage,
  className = "py-8"
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} />
      <div className={className}>
        {children}
      </div>
    </div>
  )
}

export default PageLayout
