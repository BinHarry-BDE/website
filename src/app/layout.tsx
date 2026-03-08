import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'BinHarry - BDE BUT Informatique Reims',
    template: '%s | BinHarry',
  },
  description: 'BinHarry, le BDE du BUT Informatique de Reims. Découvrez nos événements, soirées et activités étudiantes.',
  keywords: ['BinHarry', 'BDE', 'BUT Informatique', 'Reims', 'étudiants', 'soirées'],
  authors: [{ name: 'BinHarry' }],
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
    shortcut: ['/favicon.ico'],
  },
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
    <html lang="fr" className={inter.className}>
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
