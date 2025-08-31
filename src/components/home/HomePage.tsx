'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  PhoneIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  CogIcon,
  ShieldCheckIcon,
  BoltIcon,
  CheckIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Envoi de SMS Massif',
    description: 'Envoyez des milliers de SMS en quelques clics avec notre interface intuitive.',
    icon: PhoneIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    name: 'Analyses Avancées',
    description: 'Suivez vos performances avec des rapports détaillés et des métriques en temps réel.',
    icon: ChartBarIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    name: 'Gestion de Contacts',
    description: 'Organisez vos contacts en groupes et gérez vos listes facilement.',
    icon: UserGroupIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    name: 'API Puissante',
    description: 'Intégrez SMS Pro dans vos applications avec notre API REST complète.',
    icon: CogIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    name: 'Sécurité Maximale',
    description: 'Vos données sont protégées avec un chiffrement de niveau entreprise.',
    icon: ShieldCheckIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    name: 'Performance Optimale',
    description: 'Infrastructure haute performance pour une livraison rapide et fiable.',
    icon: BoltIcon,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
];

const plans = [
  {
    name: 'Démarrage',
    price: '29',
    period: '/mois',
    description: 'Parfait pour les petites entreprises',
    features: [
      '1,000 SMS/mois',
      '100 contacts',
      'Support email',
      'Rapports de base',
      'API d\'accès'
    ],
    popular: false,
  },
  {
    name: 'Professionnel',
    price: '79',
    period: '/mois',
    description: 'Idéal pour les entreprises en croissance',
    features: [
      '5,000 SMS/mois',
      '1,000 contacts',
      'Support prioritaire',
      'Analyses avancées',
      'Intégrations',
      'Modèles personnalisés'
    ],
    popular: true,
  },
  {
    name: 'Entreprise',
    price: '199',
    period: '/mois',
    description: 'Pour les grandes organisations',
    features: [
      'SMS illimités',
      'Contacts illimités',
      'Support dédié',
      'Tableaux de bord personnalisés',
      'Multi-utilisateurs',
      'Conformité avancée'
    ],
    popular: false,
  },
];

const testimonials = [
  {
    name: 'Marie Dubois',
    company: 'TechStart SAS',
    content: 'SMS Pro a révolutionné notre communication client. Nous avons augmenté notre taux d\'engagement de 300%.',
    rating: 5,
    avatar: '/avatars/marie.jpg',
  },
  {
    name: 'Pierre Martin',
    company: 'Commerce Plus',
    content: 'L\'interface est intuitive et les rapports sont très détaillés. Un outil indispensable pour notre marketing.',
    rating: 5,
    avatar: '/avatars/pierre.jpg',
  },
  {
    name: 'Sophie Laurent',
    company: 'Digital Agency',
    content: 'L\'API est excellente et l\'intégration s\'est faite sans problème. Le support technique est réactif.',
    rating: 5,
    avatar: '/avatars/sophie.jpg',
  },
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gradient">SMS Pro</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Fonctionnalités
                </a>
                <a href="#pricing" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Tarifs
                </a>
                <a href="#testimonials" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Témoignages
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/login"
                className="btn-primary"
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              La plateforme SMS
              <span className="text-gradient block">
                pour les professionnels
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Envoyez, gérez et analysez vos campagnes SMS avec la solution la plus complète du marché. 
              Boostez votre communication et augmentez vos conversions.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/login"
                className="btn-primary text-lg px-8 py-4"
              >
                Essayer gratuitement
              </Link>
              <button className="btn-secondary text-lg px-8 py-4">
                Voir la démo
              </button>
            </motion.div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full">
            <div className="w-full h-full bg-gradient-to-r from-primary-400/20 to-secondary-400/20 blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités puissantes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez toutes les fonctionnalités qui font de SMS Pro la solution de choix pour votre communication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="card hover:shadow-lg transition-shadow duration-300">
                  <div className={`${feature.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tarifs transparents
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choisissez le plan qui correspond à vos besoins. Tous nos plans incluent un essai gratuit de 14 jours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative ${plan.popular ? 'ring-2 ring-primary-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Plus populaire
                    </span>
                  </div>
                )}
                <div className="card">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price}€
                      </span>
                      <span className="text-lg text-gray-600 ml-1">
                        {plan.period}
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-colors ${
                      plan.popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Choisir ce plan
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez ce que nos clients disent de SMS Pro et comment nous les aidons à réussir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-600 mb-4">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Rejoignez des milliers d'entreprises qui utilisent SMS Pro pour améliorer leur communication.
            </p>
            <Link
              href="/login"
              className="bg-white text-primary-600 hover:bg-gray-50 font-medium py-4 px-8 rounded-lg text-lg transition-colors"
            >
              Commencer gratuitement
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">SMS Pro</h3>
              <p className="text-gray-400 mb-4">
                La plateforme SMS professionnelle qui révolutionne votre communication client.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Statut</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sécurité</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SMS Pro. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
