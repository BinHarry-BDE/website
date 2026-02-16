'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Abonnement, User } from '@/types';
import { IconTrash } from '@/components/Icons';

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<(Abonnement & { utilisateur_nom?: string; utilisateur_prenom?: string; utilisateur_email?: string })[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [newSub, setNewSub] = useState({
    utilisateur_id: 0,
    type: 'mensuel' as 'mensuel' | 'annuel' | 'evenement',
    nom: '',
    description: '',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: '',
    prix: '' as string | number,
  });
  const [isCreating, setIsCreating] = useState(false);

  const loadSubscriptions = useCallback(async () => {
    setIsLoading(true);
    const response = await api.getAllSubscriptions(page, 20, statusFilter, typeFilter);
    if (response.success && response.data) {
      setSubscriptions(response.data.items as any);
      setTotal(response.data.total);
    }
    setIsLoading(false);
  }, [page, statusFilter, typeFilter]);

  const loadUsers = useCallback(async () => {
    const response = await api.getUsers(1, 100);
    if (response.success && response.data) {
      setUsers(response.data.items);
    }
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  useEffect(() => {
    if (showCreate) {
      loadUsers();
    }
  }, [showCreate, loadUsers]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.utilisateur_id || !newSub.nom || !newSub.date_debut) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    setIsCreating(true);
    const response = await api.createSubscription({
      ...newSub,
      prix: Number(newSub.prix) || 0,
      date_fin: newSub.date_fin || undefined,
    });

    if (response.success) {
      setShowCreate(false);
      setNewSub({
        utilisateur_id: 0,
        type: 'mensuel',
        nom: '',
        description: '',
        date_debut: new Date().toISOString().split('T')[0],
        date_fin: '',
        prix: '',
      });
      setUserSearch('');
      loadSubscriptions();
    } else {
      alert(response.error || 'Erreur lors de la création');
    }

    setIsCreating(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) return;
    const response = await api.deleteSubscription(id);
    if (response.success) {
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      setTotal((prev) => prev - 1);
    }
  };

  const handleUpdateStatus = async (id: number, statut: string) => {
    const response = await api.updateSubscription(id, { statut: statut as any });
    if (response.success) {
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, statut: statut as any } : s))
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  };

  const filteredUsers = users.filter((user) => {
    if (!userSearch.trim()) return true;
    const search = userSearch.toLowerCase();
    return (
      user.nom.toLowerCase().includes(search) ||
      user.prenom.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(total / 20);

  return (
    <>
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <div className="admin-filters" style={{ margin: 0, flex: 1 }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="expire">Expiré</option>
              <option value="annule">Annulé</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">Tous les types</option>
              <option value="mensuel">Mensuel</option>
              <option value="annuel">Annuel</option>
              <option value="evenement">Événement</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Nouvel abonnement
          </button>
        </div>

        {isLoading ? (
          <div className="loading-spinner" style={{ margin: '2rem auto' }} />
        ) : (
          <>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Abonnement</th>
                    <th>Type</th>
                    <th>Prix</th>
                    <th>Dates</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <strong>{sub.utilisateur_prenom} {sub.utilisateur_nom}</strong>
                        <br />
                        <small style={{ color: '#666' }}>{sub.utilisateur_email}</small>
                      </td>
                      <td>
                        <strong>{sub.nom}</strong>
                        {sub.description && <br />}
                        {sub.description && <small style={{ color: '#666' }}>{sub.description}</small>}
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{sub.type}</td>
                      <td>{formatPrice(sub.prix)}</td>
                      <td>
                        {formatDate(sub.date_debut)}
                        {sub.date_fin && <> - {formatDate(sub.date_fin)}</>}
                      </td>
                      <td>
                        <select
                          value={sub.statut}
                          onChange={(e) => handleUpdateStatus(sub.id, e.target.value)}
                          className={`subscription-badge ${sub.statut}`}
                          style={{ border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                        >
                          <option value="actif">Actif</option>
                          <option value="expire">Expiré</option>
                          <option value="annule">Annulé</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(sub.id)}
                          title="Supprimer"
                        >
                          <IconTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Précédent
                </button>
                <span>Page {page} sur {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Suivant
                </button>
              </div>
            )}

            <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.85rem' }}>
              {total} abonnement{total > 1 ? 's' : ''} au total
            </p>
          </>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Créer un abonnement</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>×</button>
            </div>

            <form onSubmit={handleCreate} className="dashboard-form">
              <div className="dashboard-form-group">
                <label>Utilisateur *</label>
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ marginBottom: '0.5rem' }}
                />
                <select
                  value={newSub.utilisateur_id}
                  onChange={(e) => setNewSub({ ...newSub, utilisateur_id: parseInt(e.target.value) })}
                  required
                  size={5}
                  style={{ height: 'auto' }}
                >
                  <option value={0} disabled>Sélectionner un utilisateur</option>
                  {filteredUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.prenom.toUpperCase()} {user.nom.toUpperCase()} ({user.email})
                    </option>
                  ))}
                </select>
                {filteredUsers.length === 0 && userSearch && (
                  <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
                    Aucun utilisateur trouvé pour &quot;{userSearch}&quot;
                  </small>
                )}
              </div>

              <div className="dashboard-form-group">
                <label>Nom de l&apos;abonnement *</label>
                <input
                  type="text"
                  value={newSub.nom}
                  onChange={(e) => setNewSub({ ...newSub, nom: e.target.value })}
                  required
                  placeholder="Ex: Cotisation annuelle BDE"
                />
              </div>

              <div className="dashboard-form-row">
                <div className="dashboard-form-group">
                  <label>Type *</label>
                  <select
                    value={newSub.type}
                    onChange={(e) => setNewSub({ ...newSub, type: e.target.value as any })}
                  >
                    <option value="mensuel">Mensuel</option>
                    <option value="annuel">Annuel</option>
                    <option value="evenement">Événement</option>
                  </select>
                </div>
                <div className="dashboard-form-group">
                  <label>Prix (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newSub.prix}
                    onChange={(e) => setNewSub({ ...newSub, prix: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="dashboard-form-row">
                <div className="dashboard-form-group">
                  <label>Date de début *</label>
                  <input
                    type="date"
                    value={newSub.date_debut}
                    onChange={(e) => setNewSub({ ...newSub, date_debut: e.target.value })}
                    required
                  />
                </div>
                <div className="dashboard-form-group">
                  <label>Date de fin</label>
                  <input
                    type="date"
                    value={newSub.date_fin}
                    onChange={(e) => setNewSub({ ...newSub, date_fin: e.target.value })}
                  />
                </div>
              </div>

              <div className="dashboard-form-group">
                <label>Description</label>
                <textarea
                  value={newSub.description}
                  onChange={(e) => setNewSub({ ...newSub, description: e.target.value })}
                  placeholder="Description optionnelle..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={isCreating}>
                  {isCreating ? 'Création...' : 'Créer l\'abonnement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
