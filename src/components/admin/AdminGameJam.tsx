'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { GameJamEdition, GameJamEquipe, User } from '@/types';
import { IconPlus, IconTrash, IconEdit, IconUserPlus, IconX, IconLink, IconImage } from '@/components/Icons';

type Tab = 'editions' | 'equipes';

export default function AdminGameJam() {
  const [tab, setTab] = useState<Tab>('editions');
  const [editions, setEditions] = useState<GameJamEdition[]>([]);
  const [equipes, setEquipes] = useState<GameJamEquipe[]>([]);
  const [selectedEdition, setSelectedEdition] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edition form
  const [showEditionForm, setShowEditionForm] = useState(false);
  const [editionForm, setEditionForm] = useState({ year: '', theme: '', description: '', date_debut: '', date_fin: '' });

  // Equipe form
  const [showEquipeForm, setShowEquipeForm] = useState(false);
  const [editingEquipe, setEditingEquipe] = useState<GameJamEquipe | null>(null);
  const [equipeForm, setEquipeForm] = useState({ nom: '', nom_jeu: '', description: '', image_url: '', liens: [''], classement: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Add member modal
  const [showAddMember, setShowAddMember] = useState<number | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  const loadEditions = useCallback(async () => {
    const res = await api.getGameJamEditions();
    if (res.success && res.data) {
      setEditions(res.data);
      // Auto-select first edition if none selected
      const firstYear = res.data[0]?.year;
      if (firstYear) {
        setSelectedEdition(prev => prev || firstYear);
      }
    }
  }, []);

  const loadEquipes = useCallback(async () => {
    if (!selectedEdition) return;
    const res = await api.getGameJamEquipes(selectedEdition);
    if (res.success && res.data) {
      setEquipes(res.data);
    }
  }, [selectedEdition]);

  useEffect(() => {
    setLoading(true);
    loadEditions().finally(() => setLoading(false));
  }, [loadEditions]);

  useEffect(() => {
    if (selectedEdition) {
      loadEquipes();
    }
  }, [selectedEdition, loadEquipes]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  // ── Edition CRUD ──

  const handleCreateEdition = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const res = await api.createGameJamEdition({
      year: editionForm.year,
      theme: editionForm.theme || undefined,
      description: editionForm.description || undefined,
      date_debut: editionForm.date_debut || undefined,
      date_fin: editionForm.date_fin || undefined,
    });
    if (res.success) {
      setSuccess('Édition créée');
      setShowEditionForm(false);
      setEditionForm({ year: '', theme: '', description: '', date_debut: '', date_fin: '' });
      setSelectedEdition(editionForm.year);
      await loadEditions();
    } else {
      setError(res.error || 'Erreur');
    }
  };

  const handleDeleteEdition = async (year: string) => {
    if (!confirm(`Supprimer l'édition ${year} et toutes ses équipes ?`)) return;
    clearMessages();
    const res = await api.deleteGameJamEdition(year);
    if (res.success) {
      setSuccess('Édition supprimée');
      if (selectedEdition === year) setSelectedEdition('');
      await loadEditions();
    } else {
      setError(res.error || 'Erreur');
    }
  };

  // ── Equipe CRUD ──

  const resetEquipeForm = () => {
    setEquipeForm({ nom: '', nom_jeu: '', description: '', image_url: '', liens: [''], classement: '' });
    setImageFile(null);
    setEditingEquipe(null);
    setShowEquipeForm(false);
  };

  const openEditEquipe = (eq: GameJamEquipe) => {
    let liens: string[] = [];
    try { liens = JSON.parse(eq.liens); } catch { liens = []; }
    if (liens.length === 0) liens = [''];
    setEquipeForm({
      nom: eq.nom,
      nom_jeu: eq.nom_jeu || '',
      description: eq.description || '',
      image_url: eq.image_url || '',
      liens,
      classement: eq.classement ? String(eq.classement) : '',
    });
    setImageFile(null);
    setEditingEquipe(eq);
    setShowEquipeForm(true);
  };

  const handleSubmitEquipe = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const liens = equipeForm.liens.map(l => l.trim()).filter(Boolean);

    if (editingEquipe) {
      const res = await api.updateGameJamEquipe(editingEquipe.id, {
        nom: equipeForm.nom,
        nom_jeu: equipeForm.nom_jeu || undefined,
        description: equipeForm.description || undefined,
        image_url: equipeForm.image_url || undefined,
        liens,
        classement: equipeForm.classement ? parseInt(equipeForm.classement, 10) : null,
      });
      if (res.success) {
        // Upload image if a file was selected
        let imageError = '';
        if (imageFile) {
          setUploading(true);
          const uploadRes = await api.uploadTeamImage(editingEquipe.id, imageFile);
          setUploading(false);
          if (!uploadRes.success) {
            imageError = uploadRes.error || 'Erreur upload image';
          }
        }
        if (imageError) {
          setError(imageError);
        } else {
          setSuccess('Équipe mise à jour');
        }
        resetEquipeForm();
        await loadEquipes();
      } else {
        setError(res.error || 'Erreur');
      }
    } else {
      const res = await api.createGameJamEquipe({
        edition_year: selectedEdition,
        nom: equipeForm.nom,
        nom_jeu: equipeForm.nom_jeu || undefined,
        description: equipeForm.description || undefined,
        image_url: equipeForm.image_url || undefined,
        liens,
        classement: equipeForm.classement ? parseInt(equipeForm.classement, 10) : undefined,
      });
      if (res.success) {
        // Upload image if a file was selected
        let imageError = '';
        if (imageFile && res.data?.id) {
          setUploading(true);
          const uploadRes = await api.uploadTeamImage(res.data.id, imageFile);
          setUploading(false);
          if (!uploadRes.success) {
            imageError = uploadRes.error || 'Erreur upload image';
          }
        }
        if (imageError) {
          setError(imageError);
        } else {
          setSuccess('Équipe créée');
        }
        resetEquipeForm();
        await loadEquipes();
      } else {
        setError(res.error || 'Erreur');
      }
    }
  };

  const handleDeleteEquipe = async (id: number) => {
    if (!confirm('Supprimer cette équipe ?')) return;
    clearMessages();
    const res = await api.deleteGameJamEquipe(id);
    if (res.success) {
      setSuccess('Équipe supprimée');
      await loadEquipes();
    } else {
      setError(res.error || 'Erreur');
    }
  };

  const addLienField = () => setEquipeForm(prev => ({ ...prev, liens: [...prev.liens, ''] }));
  const removeLienField = (i: number) => setEquipeForm(prev => ({ ...prev, liens: prev.liens.filter((_, idx) => idx !== i) }));
  const updateLien = (i: number, val: string) => setEquipeForm(prev => {
    const liens = [...prev.liens];
    liens[i] = val;
    return { ...prev, liens };
  });

  // ── Member management ──

  const handleSearchUsers = async (query: string) => {
    setMemberSearch(query);
    if (query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const res = await api.getUsers(1, 10, query);
    if (res.success && res.data) {
      setSearchResults(res.data.items);
    }
    setSearching(false);
  };

  const handleAddMember = async (equipeId: number, userId: number) => {
    clearMessages();
    const res = await api.addTeamMember(equipeId, userId);
    if (res.success) {
      setSuccess('Membre ajouté');
      setShowAddMember(null);
      setMemberSearch('');
      setSearchResults([]);
      await loadEquipes();
    } else {
      setError(res.error || 'Erreur');
    }
  };

  const handleRemoveMember = async (equipeId: number, userId: number) => {
    clearMessages();
    const res = await api.removeTeamMember(equipeId, userId);
    if (res.success) {
      setSuccess('Membre retiré');
      await loadEquipes();
    } else {
      setError(res.error || 'Erreur');
    }
  };

  if (loading) {
    return <div className="empty-state"><div className="loading-spinner" /><p>Chargement...</p></div>;
  }

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Sub-tabs */}
      <div className="gamejam-admin-tabs">
        <button className={`btn ${tab === 'editions' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('editions')}>
          Éditions
        </button>
        <button className={`btn ${tab === 'equipes' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('equipes')}>
          Équipes
        </button>
      </div>

      {/* ── EDITIONS TAB ── */}
      {tab === 'editions' && (
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2>Éditions GameJam</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowEditionForm(true)}>
              <IconPlus size={16} /> Nouvelle édition
            </button>
          </div>

          {showEditionForm && (
            <form className="dashboard-form gamejam-edition-form" onSubmit={handleCreateEdition}>
              <div className="dashboard-form-row">
                <div className="dashboard-form-group">
                  <label>Année *</label>
                  <input type="text" placeholder="2027" maxLength={4} required value={editionForm.year}
                    onChange={e => setEditionForm(f => ({ ...f, year: e.target.value }))} />
                </div>
                <div className="dashboard-form-group">
                  <label>Thème</label>
                  <input type="text" placeholder="Thème optionnel" value={editionForm.theme}
                    onChange={e => setEditionForm(f => ({ ...f, theme: e.target.value }))} />
                </div>
              </div>
              <div className="dashboard-form-group">
                <label>Description</label>
                <textarea placeholder="Description de l'édition..." value={editionForm.description}
                  onChange={e => setEditionForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="dashboard-form-row">
                <div className="dashboard-form-group">
                  <label>Date début</label>
                  <input type="date" value={editionForm.date_debut}
                    onChange={e => setEditionForm(f => ({ ...f, date_debut: e.target.value }))} />
                </div>
                <div className="dashboard-form-group">
                  <label>Date fin</label>
                  <input type="date" value={editionForm.date_fin}
                    onChange={e => setEditionForm(f => ({ ...f, date_fin: e.target.value }))} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditionForm(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Créer</button>
              </div>
            </form>
          )}

          {editions.length === 0 ? (
            <div className="empty-state">
              <p>Aucune édition créée</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Année</th>
                    <th>Thème</th>
                    <th>Dates</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {editions.map(ed => (
                    <tr key={ed.year}>
                      <td><strong>{ed.year}</strong></td>
                      <td>{ed.theme || '—'}</td>
                      <td>
                        {ed.date_debut ? new Date(ed.date_debut).toLocaleDateString('fr-FR') : '—'}
                        {ed.date_fin ? ` → ${new Date(ed.date_fin).toLocaleDateString('fr-FR')}` : ''}
                      </td>
                      <td className="actions">
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteEdition(ed.year)}>
                          <IconTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── EQUIPES TAB ── */}
      {tab === 'equipes' && (
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2>Équipes</h2>
            <div className="gamejam-equipes-actions">
              <select className="gamejam-edition-select" value={selectedEdition}
                onChange={e => setSelectedEdition(e.target.value)}>
                {editions.length === 0 && (
                  <option value="">Aucune édition</option>
                )}
                {editions.map(ed => (
                  <option key={ed.year} value={ed.year}>Édition {ed.year}</option>
                ))}
              </select>
              {selectedEdition && (
                <button className="btn btn-primary btn-sm" onClick={() => { resetEquipeForm(); setShowEquipeForm(true); }}>
                  <IconPlus size={16} /> Nouvelle équipe
                </button>
              )}
            </div>
          </div>

          {!selectedEdition ? (
            <div className="empty-state"><p>Sélectionnez ou créez une édition d&apos;abord</p></div>
          ) : (
            <>
              {/* Equipe form modal */}
              {showEquipeForm && (
                <div className="modal-overlay" onClick={() => resetEquipeForm()}>
                  <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                      <h2>{editingEquipe ? 'Modifier l\'équipe' : 'Nouvelle équipe'}</h2>
                      <button className="modal-close" onClick={() => resetEquipeForm()}>&times;</button>
                    </div>
                    <form className="dashboard-form" onSubmit={handleSubmitEquipe}>
                      <div className="dashboard-form-group">
                        <label>Nom de l&apos;équipe *</label>
                        <input type="text" required value={equipeForm.nom}
                          onChange={e => setEquipeForm(f => ({ ...f, nom: e.target.value }))} />
                      </div>
                      <div className="dashboard-form-group">
                        <label>Nom du jeu</label>
                        <input type="text" placeholder="Nom du jeu" value={equipeForm.nom_jeu}
                          onChange={e => setEquipeForm(f => ({ ...f, nom_jeu: e.target.value }))} />
                      </div>
                      <div className="dashboard-form-group">
                        <label>Description</label>
                        <textarea placeholder="Description du projet..." value={equipeForm.description}
                          onChange={e => setEquipeForm(f => ({ ...f, description: e.target.value }))} />
                      </div>
                      <div className="dashboard-form-group">
                        <label><IconImage size={14} /> Image du jeu (logo/miniature)</label>
                        {equipeForm.image_url && !imageFile && (
                          <div className="gamejam-current-image">
                            <img src={equipeForm.image_url.startsWith('/api/') ? `${process.env.NEXT_PUBLIC_API_URL || 'https://binharry-api.bdebinharry.workers.dev'}${equipeForm.image_url}` : equipeForm.image_url} alt="Aperçu" style={{ maxWidth: 120, maxHeight: 80, borderRadius: 6, objectFit: 'cover' }} />
                            <span className="gamejam-image-hint">Image actuelle</span>
                          </div>
                        )}
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={e => {
                            const file = e.target.files?.[0] || null;
                            setImageFile(file);
                          }} />
                        {imageFile && <span className="gamejam-image-hint">{imageFile.name} ({(imageFile.size / 1024).toFixed(0)} Ko)</span>}
                      </div>
                      <div className="dashboard-form-group">
                        <label>Classement (position au podium)</label>
                        <input type="number" min="1" placeholder="1 = 1er, 2 = 2ème, 3 = 3ème, vide = hors podium"
                          value={equipeForm.classement}
                          onChange={e => setEquipeForm(f => ({ ...f, classement: e.target.value }))} />
                      </div>
                      <div className="dashboard-form-group">
                        <label><IconLink size={14} /> Liens (GitHub, itch.io, etc.)</label>
                        {equipeForm.liens.map((lien, i) => (
                          <div key={i} className="gamejam-lien-row">
                            <input type="url" placeholder="https://github.com/..." value={lien}
                              onChange={e => updateLien(i, e.target.value)} />
                            {equipeForm.liens.length > 1 && (
                              <button type="button" className="btn btn-danger btn-sm" onClick={() => removeLienField(i)}>
                                <IconX size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" className="btn btn-secondary btn-sm" onClick={addLienField}>
                          <IconPlus size={14} /> Ajouter un lien
                        </button>
                      </div>
                      <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => resetEquipeForm()}>Annuler</button>
                        <button type="submit" className="btn btn-primary" disabled={uploading}>
                          {uploading ? 'Upload en cours...' : editingEquipe ? 'Modifier' : 'Créer'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Add member modal */}
              {showAddMember !== null && (
                <div className="modal-overlay" onClick={() => { setShowAddMember(null); setMemberSearch(''); setSearchResults([]); }}>
                  <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                      <h2>Ajouter un membre</h2>
                      <button className="modal-close" onClick={() => { setShowAddMember(null); setMemberSearch(''); setSearchResults([]); }}>&times;</button>
                    </div>
                    <div className="dashboard-form-group">
                      <label>Rechercher un utilisateur</label>
                      <input type="text" placeholder="Nom, prénom ou email..." value={memberSearch}
                        onChange={e => handleSearchUsers(e.target.value)} />
                    </div>
                    {searching && <p>Recherche...</p>}
                    {searchResults.length > 0 && (
                      <div className="gamejam-search-results">
                        {searchResults.map(u => {
                          const alreadyInTeam = equipes.some(eq => eq.membres.some(m => m.id === u.id));
                          return (
                            <div key={u.id} className="gamejam-search-result-item">
                              <span>{u.prenom} {u.nom} ({u.email})</span>
                              <button className="btn btn-primary btn-sm" disabled={alreadyInTeam}
                                onClick={() => handleAddMember(showAddMember, u.id)}>
                                {alreadyInTeam ? 'Déjà inscrit' : 'Ajouter'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Equipes list */}
              {equipes.length === 0 ? (
                <div className="empty-state"><p>Aucune équipe pour cette édition</p></div>
              ) : (
                <div className="gamejam-equipes-grid">
                  {equipes.map(eq => {
                    let liens: string[] = [];
                    try { liens = JSON.parse(eq.liens); } catch { liens = []; }
                    return (
                      <div key={eq.id} className="gamejam-equipe-card dashboard-card">
                        <div className="gamejam-equipe-header">
                          {eq.image_url && (
                            <img src={eq.image_url.startsWith('/api/') ? `${process.env.NEXT_PUBLIC_API_URL || 'https://binharry-api.bdebinharry.workers.dev'}${eq.image_url}` : eq.image_url} alt={eq.nom_jeu || eq.nom} className="gamejam-equipe-image" />
                          )}
                          <div>
                            <h3>{eq.nom}</h3>
                            {eq.nom_jeu && <p className="gamejam-equipe-game">{eq.nom_jeu}</p>}
                          </div>
                          <div className="gamejam-equipe-actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => openEditEquipe(eq)}><IconEdit size={14} /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteEquipe(eq.id)}><IconTrash size={14} /></button>
                          </div>
                        </div>
                        {eq.description && <p className="gamejam-equipe-desc">{eq.description}</p>}
                        {liens.length > 0 && (
                          <div className="gamejam-equipe-liens">
                            {liens.map((l, i) => (
                              <a key={i} href={l} target="_blank" rel="noopener noreferrer" className="gamejam-lien-badge">
                                <IconLink size={12} /> {new URL(l).hostname}
                              </a>
                            ))}
                          </div>
                        )}
                        <div className="gamejam-equipe-membres">
                          <div className="gamejam-equipe-membres-header">
                            <strong>Membres ({eq.membres.length})</strong>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowAddMember(eq.id)}>
                              <IconUserPlus size={14} />
                            </button>
                          </div>
                          {eq.membres.length === 0 ? (
                            <p className="gamejam-no-membres">Aucun membre</p>
                          ) : (
                            <ul className="gamejam-membres-list">
                              {eq.membres.map(m => (
                                <li key={m.id}>
                                  <span>{m.prenom} {m.nom}</span>
                                  <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(eq.id, m.id)}>
                                    <IconX size={12} />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
