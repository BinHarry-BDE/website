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
        Les présentes conditions de vente sont conclues entre toute personne physique ou morale souhaitant effectuer un achat sur le site du BDE BinHarry (ci-après « le Client ») et la boutique gérée par Jacques Lucas pour le BDE BinHarry.
      </p>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 1. Objet</h2>
        <p className="cgv-content">
          Les présentes Conditions Générales de Vente (CGV) définissent les droits et obligations des parties dans le cadre de la vente de produits (goodies, vêtements) proposés par le BDE BinHarry via son site internet.
        </p>
        <p className="cgv-content">
          Toute commande implique l’acceptation sans réserve des présentes CGV.
        </p>
      </section>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 2. Produits</h2>
        <p className="cgv-content">
          Les produits proposés sont des goodies et vêtements aux couleurs de BinHarry. Les offres sont valables dans la limite des stocks disponibles. Aucun produit n’est vendu en précommande.
        </p>
        <p className="cgv-content">
          Les photos et descriptions sont les plus fidèles possibles mais n’engagent pas le BDE BinHarry.
        </p>
      </section>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 3. Public concerné</h2>
        <p className="cgv-content">
          Les produits sont ouverts à tous, sans restriction d’âge ou de statut.
        </p>
      </section>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 4. Prix</h2>
        <p className="cgv-content">
          Les prix sont indiqués en euros (€) toutes taxes comprises. Le BDE BinHarry se réserve le droit de modifier ses prix à tout moment, mais les produits seront facturés sur la base des tarifs en vigueur au moment de la validation de la commande.
        </p>
      </section>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 5. Commande</h2>
        <p className="cgv-content">
          La commande s’effectue en ligne sur le site. Toute commande vaut acceptation des prix et description des produits disponibles à la vente.
        </p>
        <p className="cgv-content">
          Le BDE BinHarry se réserve le droit d’annuler ou de refuser toute commande d’un client avec lequel il existerait un litige relatif au paiement d’une commande antérieure.
        </p>
      </section>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 6. Paiement</h2>
        <p className="cgv-content">
          Le paiement s’effectue soit en ligne par carte bancaire via Stripe (paiement sécurisé), soit en espèces directement au BDE lors du retrait du produit.
        </p>
        <p className="cgv-content">
          En cas de paiement en ligne, la commande est considérée comme validée à réception du paiement. En cas de paiement en espèces, la commande n’est validée qu’au moment du retrait et du paiement effectif.
        </p>
      </section>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 7. Livraison et retrait</h2>
        <p className="cgv-content">
          Aucun envoi postal n’est proposé. Les produits sont à retirer exclusivement au local du BDE BinHarry, aux horaires communiqués sur le site ou par mail.
        </p>
      </section>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 8. Droit de rétractation et retours</h2>
        <p className="cgv-content">
          Conformément à l’article L221-18 du Code de la consommation, le Client dispose d’un délai de quatorze (14) jours à compter du retrait du produit pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités.
        </p>
        <p className="cgv-content">
          Pour exercer ce droit, le Client doit contacter le BDE BinHarry par mail à bdebinharry@gmail.com. Le produit doit être retourné dans son état d’origine. Le remboursement sera effectué dans un délai de 14 jours après réception du produit retourné.
        </p>
      </section>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 9. Service client et réclamations</h2>
        <p className="cgv-content">
          Pour toute question, réclamation ou demande d’information, le Client peut contacter le BDE BinHarry à l’adresse mail : bdebinharry@gmail.com.
        </p>
      </section>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 10. Données personnelles</h2>
        <p className="cgv-content">
          Le BDE BinHarry ne collecte aucune donnée personnelle lors de la commande, hormis celles strictement nécessaires à la gestion de la commande et à la remise du produit. Aucune donnée n’est utilisée à des fins commerciales ou cédée à des tiers.
        </p>
      </section>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 11. Responsabilité</h2>
        <p className="cgv-content">
          Le BDE BinHarry ne saurait être tenu responsable des dommages résultant d’une mauvaise utilisation du produit acheté.
        </p>
      </section>

      <section className="cgv-section">
        <h2 className="cgv-subtitle">Article 12. Droit applicable</h2>
        <p className="cgv-content">
          Les présentes CGV sont soumises à la loi française. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.
        </p>
      </section>
    </article>
  );
}
