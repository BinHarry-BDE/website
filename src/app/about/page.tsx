'use client';

import { useEffect, useState } from 'react';
import type { BDEMember } from '@/types';
import { api } from '@/lib/api';
import './about.css';

export default function AboutPage() {
  const [bdeMembers, setBDEMembers] = useState<BDEMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBDEMembers() {
      const response = await api.getBDEMembers();
      if (response.success && response.data) {
        setBDEMembers(response.data);
      }
      setLoading(false);
    }
    fetchBDEMembers();
  }, []);

  return (
    <main className="about-page">
      <section className="about-hero">
        <h1>À propos de BinHarry</h1>
        <p className="about-hero-subtitle">Le Bureau Des Étudiants du BUT Informatique de Reims</p>
      </section>

      <section className="about-section">
        <h2>Notre Mission</h2>
        <p>
          BinHarry est l&apos;association étudiante qui anime la vie du BUT Informatique à l&apos;IUT de Reims. 
          Notre objectif est de créer une communauté soudée, d&apos;organiser des événements mémorables et 
          d&apos;accompagner les étudiants tout au long de leur parcours.
        </p>
      </section>

      <section className="about-section">
        <h2>Ce que nous faisons</h2>
        <div className="about-activities">
          <article className="about-activity">
            <div className="about-activity-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 21h8m-4-4v4m-4-8a4 4 0 0 1 8 0c0 1.5-1 2-1 3H9c0-1-1-1.5-1-3z"/>
                <path d="M12 5V3M5.6 5.6l1.4 1.4M3 12h2m14 0h2m-3 -6.4l-1.4 1.4"/>
              </svg>
            </div>
            <div className="about-activity-content">
              <h3>Événements</h3>
              <p>Soirées, sorties, tournois gaming et bien plus encore pour renforcer les liens entre étudiants.</p>
            </div>
          </article>
          <article className="about-activity">
            <div className="about-activity-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                <path d="M8 7h8m-8 4h6"/>
              </svg>
            </div>
            <div className="about-activity-content">
              <h3>Tutorat</h3>
              <p>Entraide entre étudiants pour réussir ensemble. Les anciens accompagnent les nouveaux.</p>
            </div>
          </article>
          <article className="about-activity">
            <div className="about-activity-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <div className="about-activity-content">
              <h3>Boutique</h3>
              <p>Goodies, vêtements et accessoires aux couleurs de BinHarry pour afficher ton appartenance.</p>
            </div>
          </article>
          <article className="about-activity">
            <div className="about-activity-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2v4l-4-4H9a2 2 0 0 1-2-2v-1"/>
                <path d="M15 2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2v4l4-4h4a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
              </svg>
            </div>
            <div className="about-activity-content">
              <h3>Communauté</h3>
              <p>Un Discord actif pour échanger, poser des questions et ne rien rater des actualités.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="about-section about-section-bde">
        <h2>BDE actuelle</h2>
        <p className="about-bde-subtitle">
          Découvrez les membres qui font vivre BinHarry au quotidien
        </p>
        {loading ? (
          <div className="about-bde-loading">Chargement...</div>
        ) : bdeMembers.length > 0 ? (
          <div className="about-bde-grid">
            {bdeMembers.map((member) => (
              <div key={member.id} className="about-bde-card">
                <div className="about-bde-avatar">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={`${member.prenom} ${member.nom}`} />
                  ) : (
                    <div className="about-bde-avatar-placeholder">
                      {member.prenom.charAt(0)}{member.nom.charAt(0)}
                    </div>
                  )}
                  <div className={`about-bde-badge about-bde-badge-${member.role}`}>
                    {member.role === 'founder' ? 'Fondateur' : 'Admin'}
                  </div>
                </div>
                <h3 className="about-bde-name">{member.prenom} {member.nom}</h3>
              </div>
            ))}
          </div>
        ) : (
          <p className="about-bde-empty">Aucun membre du BDE pour le moment.</p>
        )}
      </section>

      <section className="about-section">
        <h2>Nous rejoindre</h2>
        <p>
          Tu es étudiant au BUT Informatique de Reims ? Rejoins-nous ! L&apos;adhésion annuelle est à seulement 5€ 
          et te donne accès à tous nos événements et avantages exclusifs.
        </p>
        <div className="about-cta">
          <a href="/auth" className="about-btn about-btn-primary">Créer un compte</a>
          <a href="https://discord.gg/wXpRMds6BC" target="_blank" rel="noopener noreferrer" className="about-btn about-btn-secondary">
            Rejoindre le Discord
          </a>
        </div>
      </section>

      <section className="about-section">
        <h2>Contact</h2>
        <p>
          Une question ? Une suggestion ? N&apos;hésite pas à nous contacter par email à{' '}
          <a href="mailto:bdebinharry@gmail.com">bdebinharry@gmail.com</a> ou directement sur notre Discord.
        </p>
      </section>
    </main>
  );
}
