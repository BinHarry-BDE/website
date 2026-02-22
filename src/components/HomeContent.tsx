'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { PublicMember, Annonce } from '@/types';
import { products } from '@/data/products';

export default function HomeContent() {
  const [members, setMembers] = useState<PublicMember[]>([]);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);

  useEffect(() => {
    api.getMembers().then((res) => {
      if (res.success && res.data) setMembers(res.data);
    });
    api.getAnnonces().then((res) => {
      if (res.success && res.data) setAnnonces(res.data);
    });
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <h1 className="hero-title">BinHarry</h1>
          <p className="hero-subtitle">Le BDE du BUT Informatique de Reims</p>
          <p className="hero-desc">
            Rejoins la communauté ! Soirées, événements, tutorat et bien plus encore.
          </p>
          <div className="hero-actions">
            <Link href="/auth" className="hero-btn hero-btn-primary">
              Rejoindre le BDE
            </Link>
            <a href="https://discord.gg/wXpRMds6BC" target="_blank" rel="noopener noreferrer" className="hero-btn hero-btn-secondary">
              Discord
            </a>
          </div>
        </div>
      </section>

      {/* Annonces */}
      <section className="home-section">
        <h2 className="section-title">Annonces & Événements</h2>
        {annonces.length > 0 ? (
          <div className="annonces-grid">
            {annonces.map((a) => (
              <div key={a.id} className="annonce-card">
                <div className="annonce-header">
                  <h3>{a.titre}</h3>
                  {a.date_evenement && (
                    <span className="annonce-date">
                      {new Date(a.date_evenement).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
                <p>{a.contenu}</p>
                {a.auteur_prenom && (
                  <span className="annonce-author">
                    Par {a.auteur_prenom} {a.auteur_nom}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="annonce-empty">
            <div className="annonce-empty-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="6" y="10" width="36" height="28" rx="4" stroke="#cbd5e1" strokeWidth="2"/>
                <path d="M6 18h36M18 18v20" stroke="#cbd5e1" strokeWidth="2"/>
                <circle cx="12" cy="14" r="1.5" fill="#cbd5e1"/>
                <circle cx="17" cy="14" r="1.5" fill="#cbd5e1"/>
                <circle cx="22" cy="14" r="1.5" fill="#cbd5e1"/>
              </svg>
            </div>
            <p className="annonce-empty-title">Aucune annonce pour le moment</p>
            <p className="annonce-empty-desc">Les prochaines soirées et événements seront annoncés ici. Reste connecté !</p>
          </div>
        )}
      </section>

      {/* Adhésion */}
      <section className="home-section">
        <h2 className="section-title">Adhérer au BDE</h2>
        <p className="section-desc">
          En adhérant à BinHarry, tu soutiens la vie étudiante et tu accèdes à de nombreux avantages exclusifs.
        </p>
        <div className="pricing-grid">
          <div className="pricing-card pricing-card-featured">
            <div className="pricing-badge">Populaire</div>
            <h3 className="pricing-name">Adhésion annuelle</h3>
            <div className="pricing-price">
              <span className="pricing-amount">5</span>
              <span className="pricing-currency">€</span>
              <span className="pricing-period">/an</span>
            </div>
            <ul className="pricing-features">
              <li>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.3L6 11.6L2.7 8.3" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Accès aux soirées et événements BDE
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.3L6 11.6L2.7 8.3" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Tutorat proposé par les membres
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.3L6 11.6L2.7 8.3" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Réductions sur les activités
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.3L6 11.6L2.7 8.3" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Ton profil affiché sur le site
              </li>
            </ul>
            <button className="pricing-btn pricing-btn-primary" disabled>
              Bientôt disponible
            </button>
          </div>

          <div className="pricing-card">
            <h3 className="pricing-name">Soutien mensuel</h3>
            <div className="pricing-price">
              <span className="pricing-amount">1</span>
              <span className="pricing-currency">€</span>
              <span className="pricing-period">/mois</span>
            </div>
            <p className="pricing-subtitle">En plus de l&apos;adhésion annuelle</p>
            <ul className="pricing-features">
              <li>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.3L6 11.6L2.7 8.3" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Tous les avantages de l&apos;adhésion
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.3L6 11.6L2.7 8.3" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Soutien financier direct au BDE
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.3L6 11.6L2.7 8.3" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Accès prioritaire aux événements
              </li>
            </ul>
            <button className="pricing-btn pricing-btn-secondary" disabled>
              Bientôt disponible
            </button>
          </div>
        </div>
      </section>

      {/* GameJam Preview */}
      <section className="home-section">
        <div className="gamejam-home-cta">
          <div className="gamejam-home-cta-content">
            <span className="section-label">GAMEJAM</span>
            <h2 className="section-title">Decouvre les jeux des etudiants</h2>
            <p className="section-desc">
              Chaque annee, nos etudiants creent des jeux en equipe pendant la GameJam.
              Va voir les podiums et les projets gagnants.
            </p>
            <Link href="/gamejam" className="hero-btn hero-btn-primary">
              Voir les jeux de la GameJam
            </Link>
          </div>
          <div className="gamejam-home-cta-visual" aria-hidden="true">
            <div className="gamejam-mini-card gamejam-mini-card-1">Top 1</div>
            <div className="gamejam-mini-card gamejam-mini-card-2">Top 2</div>
            <div className="gamejam-mini-card gamejam-mini-card-3">Top 3</div>
          </div>
        </div>
      </section>

      {/* Boutique Preview */}
      <section className="home-section">
        <div className="section-header-row">
          <div>
            <span className="section-label">BOUTIQUE</span>
            <h2 className="section-title">Nos Nouveautés</h2>
          </div>
          <Link href="/boutique" className="section-link">
            Voir Tout
          </Link>
        </div>
        <div className="shop-grid">
          {products.filter(p => p.isNew).slice(0, 5).map((product) => (
            <Link href="/boutique" key={product.id} className="shop-card">
              <div className="shop-card-image">
                {product.isNew && <span className="shop-badge">NOUVEAU</span>}
                <span className="shop-placeholder">Image produit</span>
              </div>
              <div className="shop-card-info">
                <h3 className="shop-card-name">{product.name}</h3>
                {product.variant && <span className="shop-card-variant">{product.variant}</span>}
                <span className="shop-card-price">{product.price} €</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Mur des membres */}
      <section className="home-section">
        <h2 className="section-title">Nos membres</h2>
        <p className="section-desc">
          Merci à nos adhérents et contributeurs qui soutiennent BinHarry !
        </p>
        {members.length > 0 ? (
          <div className="members-wall">
            {members.map((m) => (
              <div key={m.id} className="member-bubble" title={`${m.prenom} ${m.nom}`}>
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt={`${m.prenom} ${m.nom}`} className="member-avatar-img" />
                ) : (
                  <span className="member-initials">
                    {m.prenom[0]}{m.nom[0]}
                  </span>
                )}
                <span className="member-name">{m.prenom}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="annonce-empty">
            <p className="annonce-empty-desc">Sois le premier à soutenir BinHarry !</p>
          </div>
        )}
      </section>
    </>
  );
}
