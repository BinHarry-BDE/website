'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Abonnement } from '@/types';
import { IconCreditCard } from '@/components/Icons';

export default function DashboardSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Abonnement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  const loadSubscriptions = useCallback(async () => {
    setIsLoading(true);
    const response = await api.getMySubscriptions();
    if (response.success && response.data) {
      setSubscriptions(response.data.items);
    } else {
      setError(response.error || 'Erreur lors du chargement des abonnements');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const handleCancel = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cet abonnement ?')) return;

    setCancelingId(id);
    const response = await api.cancelSubscription(id);
    if (response.success) {
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === id ? { ...sub, statut: 'annule' } : sub))
      );
    } else {
      alert(response.error || 'Erreur lors de l\'annulation');
    }
    setCancelingId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  };

  if (isLoading) {
    return (
      <div className="dashboard-card">
        <div className="loading-spinner" style={{ margin: '2rem auto' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-card">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2>Mes abonnements</h2>
        </div>

        {subscriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconCreditCard size={48} /></div>
            <h3>Aucun abonnement</h3>
            <p>Vous n&apos;avez pas encore d&apos;abonnement actif.</p>
          </div>
        ) : (
          <div className="subscription-list">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="subscription-item">
                <div className="subscription-info">
                  <h3>{sub.nom}</h3>
                  <p>
                    <strong>Type:</strong> {sub.type} • <strong>Prix:</strong> {formatPrice(sub.prix)}
                  </p>
                  <p>
                    <strong>Début:</strong> {formatDate(sub.date_debut)}
                    {sub.date_fin && <> • <strong>Fin:</strong> {formatDate(sub.date_fin)}</>}
                  </p>
                  {sub.description && <p style={{ marginTop: '0.5rem', color: '#555' }}>{sub.description}</p>}
                </div>
                <div className="subscription-actions">
                  <span className={`subscription-badge ${sub.statut}`}>{sub.statut}</span>
                  {sub.statut === 'actif' && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancel(sub.id)}
                      disabled={cancelingId === sub.id}
                    >
                      {cancelingId === sub.id ? 'Annulation...' : 'Annuler'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-card">
        <h2 style={{ marginBottom: '1rem' }}>Besoin d&apos;un abonnement ?</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Contactez le BDE BinHarry pour souscrire à un abonnement ou participer à un événement.
        </p>
        <a
          href="https://discord.gg/votre-lien-discord"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Nous contacter sur Discord
        </a>
      </div>
    </>
  );
}
