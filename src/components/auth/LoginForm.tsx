'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export function LoginForm() {
  const router = useRouter();
  const { login, signup, isLoading } = useAuth();
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isSignupMode) {
        await signup(formData.username, formData.password, formData.email);
        toast.success('Compte créé avec succès !');
        router.push('/dashboard');
      } else {
        const result = await login(formData.username, formData.password);
        toast.success('Connexion réussie !');
        
        // Rediriger vers la page admin si c'est l'admin Damzo
        if (formData.username === 'Damzo') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Une erreur est survenue';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">SMS Pro</h1>
            <p className="text-gray-600">
              {isSignupMode ? 'Créer votre compte' : 'Connectez-vous à votre compte'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="input-field"
                placeholder="Entrez votre nom d'utilisateur"
              />
            </div>

            {/* Email (signup only) */}
            {isSignupMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="votre@email.com"
                />
              </motion.div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="input-field pr-10"
                  placeholder="Entrez votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg relative"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isSignupMode ? 'Création en cours...' : 'Connexion en cours...'}
                </div>
              ) : (
                isSignupMode ? 'Créer le compte' : 'Se connecter'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">ou</span>
              </div>
            </div>
          </div>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignupMode ? (
                <>
                  Vous avez déjà un compte ?{' '}
                  <button
                    onClick={() => {
                      setIsSignupMode(false);
                      setFormData({ username: '', password: '', email: '' });
                    }}
                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Se connecter
                  </button>
                </>
              ) : (
                <>
                  Vous n'avez pas de compte ?{' '}
                  <button
                    onClick={() => {
                      setIsSignupMode(true);
                      setFormData({ username: '', password: '', email: '' });
                    }}
                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Créer un compte
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Features Preview */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-4">
              Fonctionnalités incluses :
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                SMS illimités
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Analyses avancées
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                API complète
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Support 24/7
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-500">
            Vos données sont protégées par un chiffrement SSL 256 bits
          </p>
        </motion.div>
      </div>
    </div>
  );
}
