'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { IconMegaphone } from '@/components/Icons';

export default function AdminBroadcast() {
  const [sujet, setSujet] = useState('');
  const [contenu, setContenu] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sujet.trim() || !contenu.trim()) {
      setMessage({ type: 'error', text: 'Le sujet et le contenu sont requis' });
      return;
    }

    if (!confirm('Envoyer ce message a tous les utilisateurs ?')) return;

    setIsSending(true);
    setMessage(null);

    const response = await api.broadcastMessage(sujet, contenu);

    if (response.success) {
      setMessage({ type: 'success', text: response.message || 'Message envoye avec succes' });
      setSujet('');
      setContenu('');
    } else {
      setMessage({ type: 'error', text: response.error || 'Erreur lors de l\'envoi' });
    }

    setIsSending(false);
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <IconMegaphone size={18} />
          Envoyer une annonce
        </h2>
      </div>

      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Ce message sera envoye a <strong>tous les utilisateurs actifs</strong> de la plateforme
        et apparaitra dans leur boite de reception.
      </p>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleSubmit} className="dashboard-form">
        <div className="dashboard-form-group">
          <label htmlFor="sujet">Sujet de l&apos;annonce *</label>
          <input
            type="text"
            id="sujet"
            value={sujet}
            onChange={(e) => setSujet(e.target.value)}
            placeholder="Ex: Nouvelle soiree BDE le 15 mars !"
            required
          />
        </div>

        <div className="dashboard-form-group">
          <label htmlFor="contenu">Contenu du message *</label>
          <textarea
            id="contenu"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            placeholder="Ecrivez votre message ici..."
            required
            style={{ minHeight: '200px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button type="submit" className="btn btn-primary" disabled={isSending}>
            <IconMegaphone size={16} />
            {isSending ? 'Envoi en cours...' : 'Envoyer a tous'}
          </button>
          <span style={{ color: '#888', fontSize: '0.85rem' }}>
            Le message sera marque comme &quot;systeme&quot;
          </span>
        </div>
      </form>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fef3c7', borderRadius: '8px' }}>
        <strong style={{ color: '#92400e' }}>Attention</strong>
        <p style={{ color: '#92400e', margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
          Cette fonctionnalite envoie un message a tous les utilisateurs. Utilisez-la avec parcimonie.
        </p>
      </div>
    </div>
  );
}
