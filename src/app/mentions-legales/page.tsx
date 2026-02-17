import type { Metadata } from 'next';
import './mentions.css';

export const metadata: Metadata = {
  title: 'Mentions Légales',
  description: 'Mentions légales du site BinHarry, BDE du BUT Informatique de Reims.',
};

// Page statique pour le SEO
export const dynamic = 'force-static';
export const revalidate = false;

export default function MentionsLegales() {
  return (
    <article className="mentions-container">
      <h1 className="mentions-title">Mentions Légales</h1>
      <p className="mentions-content">
        Merci de lire attentivement ces informations légales avant de consulter le site.
      </p>

      <section className="mentions-section">
        <h2 className="mentions-subtitle">ÉDITEUR DU SITE</h2>
        <p className="mentions-content">
          Ce site est édité par :<br />
          <strong>RaceUp</strong> (https://race-up.net)<br />
          <br />
          Pour le compte de l’association BDE BinHarry<br />
          Contact : bdebinharry@gmail.com
        </p>
      </section>

      <section className="mentions-section">
        <h2 className="mentions-subtitle">RESPONSABLE DE PUBLICATION</h2>
        <p className="mentions-content">
          Jules Thiefain
        </p>
      </section>

      <section className="mentions-section">
        <h2 className="mentions-subtitle">HÉBERGEMENT</h2>
        <p className="mentions-content">
          Ce site est hébergé par :<br />
          <strong>Cloudflare, Inc.</strong><br />
          101 Townsend St, San Francisco, CA 94107, États-Unis<br />
          https://www.cloudflare.com/
        </p>
      </section>

      <section className="mentions-section">
        <h2 className="mentions-subtitle">ESPACE MEMBRE</h2>
        <p className="mentions-content">
          Le site propose un espace membre permettant la création d’un compte utilisateur. L’accès à certaines fonctionnalités ou avantages peut nécessiter la création d’un compte.
        </p>
      </section>

      <section className="mentions-section">
        <h2 className="mentions-subtitle">DONNÉES PERSONNELLES</h2>
        <p className="mentions-content">
          Aucune donnée personnelle n’est collectée à des fins commerciales. Les données éventuellement collectées lors de la création d’un compte ou d’une commande sont strictement nécessaires à la gestion du service et ne sont jamais cédées à des tiers.
        </p>
      </section>

      <section className="mentions-section">
        <h2 className="mentions-subtitle">COOKIES ET TRACEURS</h2>
        <p className="mentions-content">
          Ce site n’utilise pas de cookies à des fins publicitaires ou de suivi individuel. Seuls des traceurs techniques nécessaires au fonctionnement du site peuvent être utilisés.
        </p>
      </section>

      <section className="mentions-section">
        <h2 className="mentions-subtitle">ANALYSE D’AUDIENCE</h2>
        <p className="mentions-content">
          Ce site utilise Google Analytics et RaceAnalyse pour mesurer l’audience et améliorer l’expérience utilisateur. Ces outils peuvent collecter des données anonymisées conformément à leur politique de confidentialité respective.
        </p>
      </section>

      <section className="mentions-section">
        <h2 className="mentions-subtitle">LIENS EXTERNES</h2>
        <p className="mentions-content">
          Le site propose des liens vers des réseaux sociaux (Discord, Instagram, X, Twitch) et d’autres sites partenaires. Le BDE BinHarry n’est pas responsable du contenu de ces sites externes.
        </p>
      </section>

      <section className="mentions-section">
        <h2 className="mentions-subtitle">DROITS D’AUTEUR</h2>
        <p className="mentions-content">
          Le contenu de ce site est sous licence Creative Commons BY 4.0.
        </p>
      </section>

      <section className="mentions-section">
        <h2 className="mentions-subtitle">LIMITATION DE RESPONSABILITÉ</h2>
        <p className="mentions-content">
          RaceUp et le BDE BinHarry se réservent le droit de modifier le contenu du site à tout moment, sans préavis.<br />
          Ils ne sauraient être tenus responsables des dommages directs ou indirects pouvant résulter de l’accès ou de l’utilisation du site, y compris l’inaccessibilité, les pertes de données, détériorations, destructions ou virus qui pourraient affecter l’équipement informatique de l’utilisateur.
        </p>
      </section>
    </article>
  );
}
