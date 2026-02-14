import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accueil',
  description: 'BinHarry, le BDE du BUT Informatique de Reims. Découvrez nos événements, soirées et activités étudiantes.',
};

// Page statique pour le SEO (pré-rendu au build time)
export const dynamic = 'force-static';
export const revalidate = false;

export default function Home() {
  return (
    <div className="dev-page">
      <h1>BinHarry</h1>
      <p>Bienvenue sur le site du BDE du BUT Informatique de Reims</p>
      <span className="dev-badge">🚧 Page en développement 🚧</span>
    </div>
  );
}
