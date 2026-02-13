import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'BinHarry - BDE BUT Informatique Reims',
    template: '%s | BinHarry',
  },
  description: 'BinHarry, le BDE du BUT Informatique de Reims. Découvrez nos événements, soirées et activités étudiantes.',
  keywords: ['BinHarry', 'BDE', 'BUT Informatique', 'Reims', 'étudiants', 'soirées'],
  authors: [{ name: 'BinHarry' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'BinHarry',
    title: 'BinHarry - BDE BUT Informatique Reims',
    description: 'BinHarry, le BDE du BUT Informatique de Reims. Découvrez nos événements, soirées et activités étudiantes.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BinHarry - BDE BUT Informatique Reims',
    description: 'BinHarry, le BDE du BUT Informatique de Reims.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
