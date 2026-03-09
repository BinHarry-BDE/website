'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { GameJamEdition, GameJamEquipe } from '@/types';
import { IconLink, IconLogOut, IconGamepad } from '@/components/Icons';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://binharry-api.bdebinharry.workers.dev').replace(/\/+$/, '');

function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('/api/')) return `${API_URL}${imageUrl}`;
  return imageUrl;
}

export default function DashboardGameJam() {
  const [editions, setEditions] = useState<GameJamEdition[]>([]);
  const [selectedEdition, setSelectedEdition] = useState('');
  const [equipes, setEquipes] = useState<GameJamEquipe[]>([]);
  const [myTeam, setMyTeam] = useState<GameJamEquipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadEditions = useCallback(async () => {
    const res = await api.getGameJamEditions();
    if (res.success && res.data) {
      setEditions(res.data);
      if (!selectedEdition && res.data.length > 0) {
        setSelectedEdition(res.data[0].year);
      }
    }
  }, [selectedEdition]);

  const loadData = useCallback(async () => {
    if (!selectedEdition) return;
    const [equipesRes, myTeamRes] = await Promise.all([
      api.getGameJamEquipes(selectedEdition),
      api.getMyTeam(selectedEdition),
    ]);
    if (equipesRes.success && equipesRes.data) setEquipes(equipesRes.data);
    if (myTeamRes.success) setMyTeam(myTeamRes.data ?? null);
  }, [selectedEdition]);

  useEffect(() => {
    setLoading(true);
    loadEditions().finally(() => setLoading(false));
  }, [loadEditions]);

  useEffect(() => {
    if (selectedEdition) loadData();
  }, [selectedEdition, loadData]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleJoin = async (equipeId: number) => {
    clearMessages();
    const res = await api.joinTeam(equipeId);
    if (res.success) {
      setSuccess('Inscription réussie !');
      await loadData();
    } else {
      setError(res.error || 'Erreur');
    }
  };

  const handleLeave = async (equipeId: number) => {
    if (!confirm('Quitter cette équipe ?')) return;
    clearMessages();
    const res = await api.leaveTeam(equipeId);
    if (res.success) {
      setSuccess('Vous avez quitté l\'équipe');
      await loadData();
    } else {
      setError(res.error || 'Erreur');
    }
  };

  if (loading) {
    return <div className="empty-state"><div className="loading-spinner" /><p>Chargement...</p></div>;
  }

  if (editions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><IconGamepad size={48} /></div>
        <p>Aucune édition de GameJam n&apos;est disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Edition selector */}
      {editions.length > 1 && (
        <div className="gamejam-edition-selector">
          <label>Édition :</label>
          <select value={selectedEdition} onChange={e => setSelectedEdition(e.target.value)}
            className="gamejam-edition-select">
            {editions.map(ed => (
              <option key={ed.year} value={ed.year}>{ed.year}{ed.theme ? ` — ${ed.theme}` : ''}</option>
            ))}
          </select>
        </div>
      )}

      {/* Current edition info */}
      {editions.find(e => e.year === selectedEdition)?.description && (
        <div className="dashboard-card gamejam-edition-info">
          <p>{editions.find(e => e.year === selectedEdition)!.description}</p>
        </div>
      )}

      {/* My team banner */}
      {myTeam && (
        <div className="dashboard-card gamejam-my-team">
          <div className="gamejam-my-team-header">
            <h3>Mon équipe : {myTeam.nom}</h3>
            <button className="btn btn-danger btn-sm" onClick={() => handleLeave(myTeam.id)}>
              <IconLogOut size={14} /> Quitter
            </button>
          </div>
          {myTeam.nom_jeu && <p className="gamejam-equipe-game">Jeu : {myTeam.nom_jeu}</p>}
          {myTeam.image_url && (
            <img src={getImageUrl(myTeam.image_url)} alt={myTeam.nom_jeu || myTeam.nom} className="gamejam-equipe-image-large" />
          )}
          {myTeam.description && <p>{myTeam.description}</p>}
          {(() => {
            let liens: string[] = [];
            try { liens = JSON.parse(myTeam.liens); } catch { liens = []; }
            return liens.length > 0 ? (
              <div className="gamejam-equipe-liens">
                {liens.map((l, i) => (
                  <a key={i} href={l} target="_blank" rel="noopener noreferrer" className="gamejam-lien-badge">
                    <IconLink size={12} /> {new URL(l).hostname}
                  </a>
                ))}
              </div>
            ) : null;
          })()}
          <div className="gamejam-equipe-membres">
            <strong>Membres ({myTeam.membres.length})</strong>
            <ul className="gamejam-membres-list">
              {myTeam.membres.map(m => (
                <li key={m.id}><span>{m.prenom} {m.nom}</span></li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* All teams */}
      <div className="dashboard-card">
        <h2>Équipes disponibles</h2>
        {equipes.length === 0 ? (
          <div className="empty-state"><p>Aucune équipe pour cette édition</p></div>
        ) : (
          <div className="gamejam-equipes-grid">
            {equipes.map(eq => {
              const isMine = myTeam?.id === eq.id;
              let liens: string[] = [];
              try { liens = JSON.parse(eq.liens); } catch { liens = []; }
              return (
                <div key={eq.id} className={`gamejam-equipe-card-user ${isMine ? 'is-mine' : ''}`}>
                  <div className="gamejam-equipe-header">
                    {eq.image_url && (
                      <img src={getImageUrl(eq.image_url)} alt={eq.nom_jeu || eq.nom} className="gamejam-equipe-image" />
                    )}
                    <div>
                      <h3>{eq.nom}</h3>
                      {eq.nom_jeu && <p className="gamejam-equipe-game">{eq.nom_jeu}</p>}
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
                    <strong>Membres ({eq.membres.length})</strong>
                    <ul className="gamejam-membres-list compact">
                      {eq.membres.map(m => (
                        <li key={m.id}>{m.prenom} {m.nom}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="gamejam-equipe-join">
                    {isMine ? (
                      <span className="gamejam-badge-mine">Mon équipe</span>
                    ) : myTeam ? (
                      <span className="gamejam-badge-already">Déjà inscrit dans une équipe</span>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => handleJoin(eq.id)}>
                        Rejoindre
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
