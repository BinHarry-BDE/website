'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
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
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setIsUserDropdownOpen(false);
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

  const handleSelectUser = (user: User) => {
    setNewSub({ ...newSub, utilisateur_id: user.id });
    setUserSearch(`${user.prenom} ${user.nom}`);
    setIsUserDropdownOpen(false);
  };

  const handleCloseModal = () => {
    setShowCreate(false);
    setUserSearch('');
    setIsUserDropdownOpen(false);
    setNewSub({
      utilisateur_id: 0,
      type: 'mensuel',
      nom: '',
      description: '',
      date_debut: new Date().toISOString().split('T')[0],
      date_fin: '',
      prix: '',
    });
  };

  const getSelectedUserDisplay = () => {
    const selectedUser = users.find((u) => u.id === newSub.utilisateur_id);
    if (selectedUser) {
      return `${selectedUser.prenom.toUpperCase()} ${selectedUser.nom.toUpperCase()} (${selectedUser.email})`;
    }
    return userSearch;
  };

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
        <div className="modal-overlay" onClick={() => handleCloseModal()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Créer un abonnement</h2>
              <button className="modal-close" onClick={() => handleCloseModal()}>×</button>
            </div>

            <form onSubmit={handleCreate} className="dashboard-form">
              <div className="dashboard-form-group" ref={userDropdownRef} style={{ position: 'relative' }}>
                <label>Utilisateur *</label>
                <input
                  type="text"
                  placeholder="Rechercher et sélectionner un utilisateur..."
                  value={newSub.utilisateur_id ? getSelectedUserDisplay() : userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setNewSub({ ...newSub, utilisateur_id: 0 });
                    setIsUserDropdownOpen(true);
                  }}
                  onFocus={() => setIsUserDropdownOpen(true)}
                  required={!newSub.utilisateur_id}
                  style={{ width: '100%' }}
                />
                
                {isUserDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'white',
                      border: '1px solid #ccc',
                      borderTop: 'none',
                      borderRadius: '0 0 4px 4px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          style={{
                            padding: '0.75rem 1rem',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f0f0f0',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                          }}
                        >
                          <strong>{user.prenom.toUpperCase()} {user.nom.toUpperCase()}</strong>
                          <br />
                          <small style={{ color: '#666' }}>{user.email}</small>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '0.75rem 1rem', color: '#999', textAlign: 'center' }}>
                        Aucun utilisateur trouvé
                      </div>
                    )}
                  </div>
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
