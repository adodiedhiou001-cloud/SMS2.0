import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/providers';
// Initialisation du planificateur de campagnes SMS
// Le planificateur de campagnes est démarré côté serveur en production uniquement.
// Ne pas importer `init-scheduler` ici pour éviter des initialisations lentes en mode dev.

export const metadata: Metadata = {
  title: 'SMS Pro - Plateforme SMS Professionnelle',
  description: 'Solution complète de marketing SMS pour les entreprises. Envoyez, gérez et analysez vos campagnes SMS en toute simplicité.',
  keywords: ['SMS', 'marketing', 'messaging', 'entreprise', 'campagne'],
  authors: [{ name: 'SMS Pro Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'SMS Pro - Plateforme SMS Professionnelle',
    description: 'Solution complète de marketing SMS pour les entreprises',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SMS Pro - Plateforme SMS Professionnelle',
    description: 'Solution complète de marketing SMS pour les entreprises',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
