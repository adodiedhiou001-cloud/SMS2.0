'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  href: string
  label?: string
  className?: string
}

const BackButton: React.FC<BackButtonProps> = ({ 
  href, 
  label = "Retour",
  className = "inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
}) => {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(href)}
      className={className}
    >
      <ArrowLeft className="mr-1 h-4 w-4" />
      {label}
    </button>
  )
}

export default BackButton
