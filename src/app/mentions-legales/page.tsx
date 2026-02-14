import type { Metadata } from 'next';
import './mentions.css';

export const metadata: Metadata = {
  title: 'Mentions Légales',
  description: 'Mentions légales du site BinHarry, BDE du BUT Informatique de Reims.',
};

// Page dynamique (rendu côté serveur pour OpenNext)
export const dynamic = 'force-dynamic';

export default function MentionsLegales() {
  return (
    <article className="mentions-container">
      <h1 className="mentions-title">Mentions Légales</h1>
      
      <p className="mentions-content">
        Merci de lire attentivement ces informations légales avant de consulter le site.
      </p>

      <section className="mentions-section">
        <h2 className="mentions-subtitle">INFORMATIONS EDITEUR</h2>
        <p className="mentions-content">
          BDE Département info de l'IUT de Reims - Bin'Harry<br />
          IUT DE REIMS DEPARTEMENT INFORMATIQUE<br />
          Chemin des Rouliers<br />
          51100 REIMS<br />
          Mail : bdebinharry@gmail.com
        </p>
      </section>

      <section className="mentions-section">
        <h2 className="mentions-subtitle">HÉBERGEMENT</h2>
        <p className="mentions-content">
          Webstrator - OctoGency<br />
          <br />
          SARL au capital de 1000€<br />
          N° TVA : FR79 844 727 594<br />
          Lieu-dit En Roc - 81100 Castres
        </p>
      </section>

      <section className="mentions-section">
        <h2 className="mentions-subtitle">INFORMATIQUE ET LIBERTÉ</h2>
        <p className="mentions-content">
          En tant qu’utilisateur, vous disposez gratuitement d’un droit d’accès, de modification et de suppression de votre contribution. Pour cela, vous pouvez adresser votre demande par courrier ou Email à :<br />
          BDE Département info de l'IUT de Reims - Bin'Harry<br />
          IUT DE REIMS DEPARTEMENT INFORMATIQUE<br />
          Chemin des Rouliers<br />
          51100 REIMS<br />
          Mail : bdebinharry@gmail.com<br />
          <br />
          Nous vous informons que les informations recueillies par le biais des différents formulaires présents sur ce site ne sauraient être divulguées à de tierces parties, ni faire l’objet de quelconques actions de revente ou de toute autre utilisation commerciale.
        </p>
      </section>

      <section className="mentions-section">
        <h2 className="mentions-subtitle">DROITS D'AUTEURS</h2>
        <p className="mentions-content">
          Le contenu de ce site est sous la licence Creative Commons BY 4.0
        </p>
      </section>

      <section className="mentions-section">
        <h2 className="mentions-subtitle">LIMITATION DE RESPONSABILITÉ</h2>
        <p className="mentions-content">
          Le BDE se réserve le droit de modifier ou de corriger le contenu de son site à tout moment, sans préavis.<br />
          <br />
          Le BDE ne pourra être tenu pour responsable en cas de contamination des matériels informatiques des internautes résultant de la propagation d’un virus ou autres infections informatiques. Il appartient à l’utilisateur de ce site de prendre toutes les mesures appropriées de façon à protéger ses propres données et/ou logiciels de la contamination par des éventuels virus circulant sur le réseau Internet.<br />
          <br />
          En aucun cas le BDE, ses employés ou les tiers mentionnés dans son site ne pourront être tenus responsables, au titre d’une action en responsabilité contractuelle, en responsabilité délictuelle ou de tout autre action, de tout dommage direct ou indirect, incident ou accessoire, ou de quelque nature qu’il soit ou de tout préjudice, notamment, de nature financier, résultant de l’utilisation de son site ou d’une quelconque information obtenue sur son site.
        </p>
      </section>
    </article>
  );
}
