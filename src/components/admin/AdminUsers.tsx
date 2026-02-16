'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types';
import { IconEdit, IconTrash, IconBan, IconCheck, IconImage, IconUserCheck, IconUserX, IconEye } from '@/components/Icons';

export default function AdminUsers() {
  const [users, setUsers] = useState<(User & { last_login?: string | null })[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<(User & { last_login?: string | null }) | null>(null);
  const [detailUser, setDetailUser] = useState<(User & { last_login?: string | null }) | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    const response = await api.getUsers(page, 20, search, roleFilter);
    if (response.success && response.data) {
      setUsers(response.data.items as (User & { last_login?: string | null })[]);
      setTotal(response.data.total);
    }
    setIsLoading(false);
  }, [page, search, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => setActionMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  const handleToggleActive = async (user: User) => {
    const newActive = user.is_active === 0;
    const response = await api.updateUser(user.id, { is_active: newActive });
    if (response.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: newActive ? 1 : 0 } : u))
      );
      setActionMessage({ type: 'success', text: `${user.prenom} ${user.nom} ${newActive ? 'active' : 'desactive'}` });
    }
  };

  const handleChangeRole = async (user: User, newRole: 'user' | 'admin') => {
    if (!confirm(`Changer le role de ${user.prenom} ${user.nom} en ${newRole} ?`)) return;
    const response = await api.updateUser(user.id, { role: newRole });
    if (response.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
      setActionMessage({ type: 'success', text: `Role de ${user.prenom} mis a jour` });
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Supprimer definitivement le compte de ${user.prenom} ${user.nom} ?`)) return;
    const response = await api.deleteUser(user.id, true);
    if (response.success) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setTotal((prev) => prev - 1);
      setActionMessage({ type: 'success', text: `Compte de ${user.prenom} supprime` });
    }
  };

  const handleDeleteAvatar = async (user: User) => {
    if (!confirm(`Supprimer la photo de profil de ${user.prenom} ${user.nom} ?`)) return;
    const response = await api.deleteUserAvatar(user.id);
    if (response.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, avatar_url: null } : u))
      );
      if (detailUser?.id === user.id) {
        setDetailUser({ ...detailUser, avatar_url: null });
      }
      setActionMessage({ type: 'success', text: `Photo de ${user.prenom} supprimee` });
    }
  };

  const handleToggleAdhesion = async (user: User, action: 'add' | 'remove') => {
    const response = await api.toggleAdhesion(user.id, action);
    if (response.success) {
      setActionMessage({ type: 'success', text: response.message || (action === 'add' ? 'Adhesion accordee' : 'Adhesion retiree') });
    } else {
      setActionMessage({ type: 'error', text: response.error || 'Erreur' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalPages = Math.ceil(total / 20);

  if (detailUser) {
    return (
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2>Profil de {detailUser.prenom} {detailUser.nom}</h2>
          <button className="btn btn-secondary btn-sm" onClick={() => setDetailUser(null)}>
            Retour a la liste
          </button>
        </div>

        <div className="user-detail-grid">
          <div className="user-detail-avatar-section">
            {detailUser.avatar_url ? (
              <img src={detailUser.avatar_url} alt="" className="user-detail-avatar" />
            ) : (
              <div className="user-detail-avatar user-detail-avatar-placeholder">
                {detailUser.prenom[0]}{detailUser.nom[0]}
              </div>
            )}
            {detailUser.avatar_url && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteAvatar(detailUser)}
                style={{ marginTop: '0.5rem' }}
              >
                <IconImage size={14} /> Supprimer la photo
              </button>
            )}
          </div>

          <div className="user-detail-info">
            <div className="user-detail-field">
              <span className="user-detail-label">Nom complet</span>
              <span>{detailUser.prenom} {detailUser.nom}</span>
            </div>
            <div className="user-detail-field">
              <span className="user-detail-label">Email</span>
              <span>{detailUser.email}</span>
            </div>
            <div className="user-detail-field">
              <span className="user-detail-label">Role</span>
              <span className={`role-badge ${detailUser.role}`}>{detailUser.role}</span>
            </div>
            <div className="user-detail-field">
              <span className="user-detail-label">Statut</span>
              <span className={`status-badge ${detailUser.is_active ? 'active' : 'inactive'}`}>
                {detailUser.is_active ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <div className="user-detail-field">
              <span className="user-detail-label">Email verifie</span>
              <span>{detailUser.email_verified ? 'Oui' : 'Non'}</span>
            </div>
            <div className="user-detail-field">
              <span className="user-detail-label">Inscrit le</span>
              <span>{formatDate(detailUser.created_at)}</span>
            </div>
            <div className="user-detail-field">
              <span className="user-detail-label">Derniere connexion</span>
              <span>{detailUser.last_login ? formatDate(detailUser.last_login) : 'Jamais'}</span>
            </div>
          </div>
        </div>

        <div className="user-detail-actions">
          <button className="btn btn-primary btn-sm" onClick={() => handleToggleAdhesion(detailUser, 'add')}>
            <IconUserCheck size={14} /> Accorder adhesion
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => handleToggleAdhesion(detailUser, 'remove')}>
            <IconUserX size={14} /> Retirer adhesion
          </button>
          <button
            className={`btn btn-sm ${detailUser.is_active ? 'btn-secondary' : 'btn-success'}`}
            onClick={() => handleToggleActive(detailUser)}
          >
            {detailUser.is_active ? <><IconBan size={14} /> Desactiver</> : <><IconCheck size={14} /> Activer</>}
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => { handleDeleteUser(detailUser); setDetailUser(null); }}>
            <IconTrash size={14} /> Supprimer le compte
          </button>
        </div>

        {actionMessage && (
          <div className={`alert alert-${actionMessage.type}`} style={{ marginTop: '1rem' }}>
            {actionMessage.text}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {actionMessage && (
        <div className={`alert alert-${actionMessage.type}`}>{actionMessage.text}</div>
      )}

      <div className="dashboard-card">
        <div className="admin-filters">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">Tous les roles</option>
            <option value="user">Utilisateurs</option>
            <option value="admin">Admins</option>
          </select>
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
                    <th>Email</th>
                    <th>Role</th>
                    <th>Statut</th>
                    <th>Inscrit le</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600 }}>
                              {user.prenom[0]}{user.nom[0]}
                            </div>
                          )}
                          <strong>{user.prenom} {user.nom}</strong>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                      <td>
                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                          {user.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td>{formatDate(user.created_at)}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => setDetailUser(user)} title="Voir"><IconEye size={14} /></button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditingUser(user)} title="Modifier"><IconEdit size={14} /></button>
                          <button className={`btn btn-sm ${user.is_active ? 'btn-secondary' : 'btn-success'}`} onClick={() => handleToggleActive(user)} title={user.is_active ? 'Desactiver' : 'Activer'}>
                            {user.is_active ? <IconBan size={14} /> : <IconCheck size={14} />}
                          </button>
                          {user.avatar_url && (
                            <button className="btn btn-secondary btn-sm" onClick={() => handleDeleteAvatar(user)} title="Supprimer photo"><IconImage size={14} /></button>
                          )}
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(user)} title="Supprimer"><IconTrash size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Precedent</button>
                <span>Page {page} sur {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Suivant</button>
              </div>
            )}

            <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.85rem' }}>
              {total} utilisateur{total > 1 ? 's' : ''} au total
            </p>
          </>
        )}
      </div>

      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Modifier l&apos;utilisateur</h2>
              <button className="modal-close" onClick={() => setEditingUser(null)}>&times;</button>
            </div>
            <div className="dashboard-form">
              <div className="dashboard-form-group">
                <label>Nom complet</label>
                <input type="text" value={`${editingUser.prenom} ${editingUser.nom}`} disabled />
              </div>
              <div className="dashboard-form-group">
                <label>Email</label>
                <input type="email" value={editingUser.email} disabled />
              </div>
              <div className="dashboard-form-group">
                <label>Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => {
                    handleChangeRole(editingUser, e.target.value as 'user' | 'admin');
                    setEditingUser({ ...editingUser, role: e.target.value as 'user' | 'admin' });
                  }}
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={() => handleToggleAdhesion(editingUser, 'add')}>
                  <IconUserCheck size={14} /> Accorder adhesion
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => handleToggleAdhesion(editingUser, 'remove')}>
                  <IconUserX size={14} /> Retirer adhesion
                </button>
              </div>
              {actionMessage && (
                <div className={`alert alert-${actionMessage.type}`}>{actionMessage.text}</div>
              )}
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setEditingUser(null)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
