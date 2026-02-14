import type { Metadata } from 'next';
import './cgv.css';

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente',
  description: 'Conditions Générales de Vente (CGV) du BDE BinHarry - Adhésion et services.',
};

// Page statique pour le SEO
export const dynamic = 'force-static';
export const revalidate = false;

export default function CGV() {
  return (
    <article className="cgv-container">
      <h1 className="cgv-title">Conditions Générales de Vente</h1>
      
      <p className="cgv-content">
        Les présentes conditions de vente sont conclues d’une part par l'association BDE BinHarry (ci-après dénommée "l'Association"), 
        et d’autre part, par toute personne physique ou morale souhaitant procéder à une adhésion ou un achat via le site internet de l'Association (ci-après dénommée "l'Adhérent" ou "le Client").
      </p>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 1. Objet</h2>
        <p className="cgv-content">
          Les présentes Conditions Générales de Vente (CGV) visent à définir les relations contractuelles entre l'Association et l'Adhérent 
          ainsi que les conditions applicables à tout achat ou souscription effectué par le biais du site internet de l'Association.
        </p>
        <p className="cgv-content">
          L’acquisition d’un bien ou service à travers le présent site implique une acceptation sans réserve par l'Adhérent des présentes conditions de vente.
        </p>
      </section>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 2. Services et Adhésion</h2>
        <p className="cgv-content">
          L'Association propose principalement un service d'adhésion ("Cotisation") permettant d'accéder aux avantages et événements du BDE BinHarry.
        </p>
        <p className="cgv-content">
          Cette adhésion est proposée sous forme d'abonnement :
        </p>
        <ul className="cgv-list">
          <li>Sans engagement de durée.</li>
          <li>Résiliable à tout moment par l'Adhérent depuis son espace personnel.</li>
          <li>Renouvelable tacitement selon la périodicité choisie lors de la souscription (mensuelle ou annuelle).</li>
        </ul>
      </section>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 3. Tarifs</h2>
        <p className="cgv-content">
          Les prix des adhésions sont indiqués en euros (€) toutes taxes comprises (TTC). 
          L'Association se réserve le droit de modifier ses prix à tout moment, étant toutefois entendu que le prix figurant au catalogue le jour de la commande sera le seul applicable à l'Adhérent.
        </p>
      </section>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 4. Modalités de Paiement</h2>
        <p className="cgv-content">
          Le règlement des adhésions s'effectue par carte bancaire via une plateforme de paiement sécurisée. 
          Les données de paiement sont chiffrées et ne transitent pas en clair sur les serveurs de l'Association.
        </p>
      </section>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 5. Rétractation et Résiliation</h2>
        
        <p className="cgv-content"><strong>5.1. Droit de rétractation</strong></p>
        <p className="cgv-content">
          Conformément à l’article L221-18 du Code de la consommation, l'Adhérent dispose d’un délai de quatorze (14) jours pour exercer son droit de rétractation 
          sans avoir à motiver sa décision, à compter de la date de souscription.
        </p>
        <p className="cgv-content">
          Toutefois, si l'Adhérent a expressément demandé à bénéficier des services associés à l'adhésion avant la fin du délai de rétractation 
          (participation à un événement, accès à des avantages exclusifs), il renonce à ce droit pour la période commencée.
        </p>

        <p className="cgv-content"><strong>5.2. Résiliation de l'abonnement</strong></p>
        <p className="cgv-content">
          L'adhésion étant sans engagement, l'Adhérent peut résilier son abonnement à tout moment via son espace membre sur le site.
          La résiliation prendra effet à la fin de la période de facturation en cours. Aucun remboursement pro rata temporis ne sera effectué pour la période entamée.
        </p>
      </section>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 6. Responsabilité</h2>
        <p className="cgv-content">
          L'Association, dans le processus de vente en ligne, n’est tenue que par une obligation de moyens. Sa responsabilité ne pourra être engagée 
          pour un dommage résultant de l’utilisation du réseau Internet tel que perte de données, intrusion, virus, rupture du service, ou autres problèmes involontaires.
        </p>
      </section>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 7. Données Personnelles</h2>
        <p className="cgv-content">
          L'Association s'engage à préserver la confidentialité des informations fournies par l'Adhérent. 
          Celles-ci ne seront utilisées que pour la gestion de l'adhésion et la communication interne de l'Association.
          Conformément à la loi "Informatique et Libertés", l'Adhérent dispose d'un droit d'accès, de modification et de suppression des informations le concernant.
        </p>
      </section>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 8. Règlement des litiges</h2>
        <p className="cgv-content">
          Les présentes conditions de vente en ligne sont soumises à la loi française. En cas de litige, la compétence est attribuée aux tribunaux compétents, 
          nonobstant pluralité de défendeurs ou appel en garantie.
        </p>
      </section>
    </article>
  );
}
