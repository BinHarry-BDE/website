import type { Metadata } from 'next';
import HomeContent from '@/components/HomeContent';

export const metadata: Metadata = {
  title: 'Accueil',
  description: 'BinHarry, le BDE du BUT Informatique de Reims. Découvrez nos événements, soirées et activités étudiantes.',
};

export default function Home() {
  return <HomeContent />;
}
