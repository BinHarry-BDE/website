'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import type {
  GameJamAdminDetail,
  GameJamEdition,
  GameJamEditionWithTeams,
  GameJamReactionSummary,
  GameJamReactionType,
  GameJamReactionsPayload,
  GameJamUserReaction,
} from '@/types';
import type { GameJamYear } from './data';
import { getGameJamImagePath, rankLabel } from './data';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://binharry-api.bdebinharry.workers.dev').replace(/\/+$/, '');

type GameJamClientProps = {
  staticEditions: GameJamYear[];
};

type SummaryByGame = Map<string, GameJamReactionSummary>;
type UserReactionByGame = Map<string, GameJamUserReaction>;
type AdminDetailsByGame = Map<string, GameJamAdminDetail[]>;

// Reactions keyed by edition year
type ReactionsByEdition = Map<string, GameJamReactionsPayload>;

function formatAdminReactions(detail: GameJamAdminDetail): string {
  const votes: string[] = [];
  if (detail.like) votes.push('Like');
  if (detail.dislike) votes.push('Dislike');
  if (detail.heart) votes.push('Coeur');
  return votes.join(' + ');
}

function getTeamImageUrl(imageUrl: string | null): string {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('/api/')) return `${API_URL}${imageUrl}`;
  return imageUrl;
}

function getTeamGameId(equipeId: number): string {
  return `equipe-${equipeId}`;
}

function getTeamLinks(liens: string): string[] {
  try {
    return JSON.parse(liens) as string[];
  } catch {
    return [];
  }
}

export default function GameJamClient({ staticEditions }: GameJamClientProps) {
  const { user, isAuthenticated } = useAuth();
  const [reactionsByEdition, setReactionsByEdition] = useState<ReactionsByEdition>(new Map());
  const [isLoadingReactions, setIsLoadingReactions] = useState(true);
  const [reactionError, setReactionError] = useState('');
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);

  // Dynamic editions from API
  const [dynamicEditions, setDynamicEditions] = useState<GameJamEditionWithTeams[]>([]);
  const [loadingEditions, setLoadingEditions] = useState(true);

  const canSeeVoters = user?.role === 'admin' || user?.role === 'founder';

  // Load dynamic editions
  useEffect(() => {
    const load = async () => {
      setLoadingEditions(true);
      // Try the dedicated public endpoint first, fallback to fetching editions + equipes separately
      const res = await api.getPublicEditions();
      if (res.success && res.data) {
        setDynamicEditions(res.data);
      } else {
        // Fallback: fetch editions list then equipes for each
        const edRes = await api.getGameJamEditions();
        if (edRes.success && edRes.data) {
          const withTeams = await Promise.all(
            edRes.data.map(async (edition: GameJamEdition) => {
              const eqRes = await api.getGameJamEquipes(edition.year);
              return {
                ...edition,
                equipes: (eqRes.success && eqRes.data) ? eqRes.data : [],
              } as GameJamEditionWithTeams;
            })
          );
          setDynamicEditions(withTeams);
        }
      }
      setLoadingEditions(false);
    };
    void load();
  }, []);

  // Compute all edition years that need reactions loaded
  const allEditionYears = useMemo(() => {
    const years = new Set<string>();
    for (const ed of staticEditions) years.add(ed.year);
    for (const ed of dynamicEditions) years.add(ed.year);
    return Array.from(years);
  }, [staticEditions, dynamicEditions]);

  // Static edition years (to avoid rendering duplicates)
  const staticYears = useMemo(() => new Set(staticEditions.map(e => e.year)), [staticEditions]);

  // Dynamic editions that DON'T overlap with static ones
  const uniqueDynamicEditions = useMemo(
    () => dynamicEditions.filter(ed => !staticYears.has(ed.year)),
    [dynamicEditions, staticYears]
  );

  // Dynamic editions that DO overlap with static (to merge reactions)
  const overlappingDynamic = useMemo(() => {
    const map = new Map<string, GameJamEditionWithTeams>();
    for (const ed of dynamicEditions) {
      if (staticYears.has(ed.year)) map.set(ed.year, ed);
    }
    return map;
  }, [dynamicEditions, staticYears]);

  // Load reactions for all editions
  const loadAllReactions = useCallback(async () => {
    if (allEditionYears.length === 0) return;

    setIsLoadingReactions(true);
    setReactionError('');

    const nextMap = new Map<string, GameJamReactionsPayload>();

    const results = await Promise.all(
      allEditionYears.map(async (year) => {
        const res = await api.getGameJamReactions(year);
        return { year, res };
      })
    );

    for (const { year, res } of results) {
      if (res.success && res.data) {
        nextMap.set(year, res.data);
      }
    }

    setReactionsByEdition(nextMap);
    setIsLoadingReactions(false);
  }, [allEditionYears]);

  useEffect(() => {
    void loadAllReactions();
  }, [loadAllReactions, isAuthenticated, user?.role]);

  // Helper maps per edition
  function getSummaryMap(year: string): SummaryByGame {
    const map = new Map<string, GameJamReactionSummary>();
    const payload = reactionsByEdition.get(year);
    for (const s of payload?.summaries || []) map.set(s.game_id, s);
    return map;
  }

  function getUserReactionMap(year: string): UserReactionByGame {
    const map = new Map<string, GameJamUserReaction>();
    const payload = reactionsByEdition.get(year);
    for (const r of payload?.userReactions || []) map.set(r.game_id, r);
    return map;
  }

  function getAdminDetailsMap(year: string): AdminDetailsByGame {
    const map = new Map<string, GameJamAdminDetail[]>();
    const payload = reactionsByEdition.get(year);
    for (const d of payload?.adminDetails || []) {
      const arr = map.get(d.game_id) || [];
      arr.push(d);
      map.set(d.game_id, arr);
    }
    return map;
  }

  const handleReaction = useCallback(
    async (editionYear: string, gameId: string, reaction: GameJamReactionType) => {
      if (!isAuthenticated) return;

      const actionKey = `${gameId}-${reaction}`;
      setPendingActionKey(actionKey);
      setReactionError('');

      const response = await api.toggleGameJamReaction(editionYear, gameId, reaction);
      if (response.success && response.data) {
        setReactionsByEdition(prev => {
          const next = new Map(prev);
          next.set(editionYear, response.data!);
          return next;
        });
      } else {
        setReactionError(response.error || 'Impossible de mettre a jour ta reaction.');
      }

      setPendingActionKey(null);
    },
    [isAuthenticated]
  );

  const renderReactionBlock = (editionYear: string, gameId: string) => {
    const summaryMap = getSummaryMap(editionYear);
    const userReactionMap = getUserReactionMap(editionYear);
    const adminDetailsMap = getAdminDetailsMap(editionYear);

    const summary = summaryMap.get(gameId) || { game_id: gameId, likes: 0, dislikes: 0, hearts: 0 };
    const myReaction = userReactionMap.get(gameId);
    const adminDetails = canSeeVoters ? adminDetailsMap.get(gameId) || [] : [];

    return (
      <div className="gamejam-reactions-block">
        <div className="gamejam-reactions-summary">
          <span>{summary.likes} like(s)</span>
          <span>{summary.dislikes} dislike(s)</span>
          <span>{summary.hearts} coeur(s)</span>
        </div>

        {isAuthenticated ? (
          <div className="gamejam-reactions-actions">
            <button
              type="button"
              className={`gamejam-reaction-btn reaction-like ${myReaction?.like ? 'is-active' : ''}`}
              onClick={() => void handleReaction(editionYear, gameId, 'like')}
              disabled={pendingActionKey === `${gameId}-like`}
              aria-label="Like"
              title="Like"
            >
              <svg className="gamejam-reaction-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M7 22H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3m0 9V13m0 9h8.4a2 2 0 0 0 1.96-1.6l1.2-6A2 2 0 0 0 16.6 12H14V7a3 3 0 0 0-3-3l-4 9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className={`gamejam-reaction-btn reaction-dislike ${myReaction?.dislike ? 'is-active' : ''}`}
              onClick={() => void handleReaction(editionYear, gameId, 'dislike')}
              disabled={pendingActionKey === `${gameId}-dislike`}
              aria-label="Dislike"
              title="Dislike"
            >
              <svg className="gamejam-reaction-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M7 2H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h3m0-9v9m0-9h8.4a2 2 0 0 1 1.96 1.6l1.2 6A2 2 0 0 1 16.6 12H14v5a3 3 0 0 1-3 3l-4-9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className={`gamejam-reaction-btn reaction-heart ${myReaction?.heart ? 'is-active' : ''}`}
              onClick={() => void handleReaction(editionYear, gameId, 'heart')}
              disabled={pendingActionKey === `${gameId}-heart`}
              aria-label="Coeur"
              title="Coeur"
            >
              <div className="heart-container" title="Like">
                <input
                  type="checkbox"
                  className="checkbox"
                  id={`heart-${gameId}`}
                  checked={Boolean(myReaction?.heart)}
                  readOnly
                  aria-hidden="true"
                  tabIndex={-1}
                />
                <div className="svg-container">
                  <svg viewBox="0 0 24 24" className="svg-outline" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z" />
                  </svg>
                  <svg viewBox="0 0 24 24" className="svg-filled" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z" />
                  </svg>
                  <svg className="svg-celebrate" width="100" height="100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <polygon points="10,10 20,20" />
                    <polygon points="10,50 20,50" />
                    <polygon points="20,80 30,70" />
                    <polygon points="90,10 80,20" />
                    <polygon points="90,50 80,50" />
                    <polygon points="80,80 70,70" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <p className="gamejam-reactions-login">Connecte-toi pour reagir a ce jeu.</p>
        )}

        {canSeeVoters && adminDetails.length > 0 && (
          <div className="gamejam-admin-reactions">
            <p className="gamejam-admin-reactions-title">Votes utilisateurs:</p>
            <ul className="gamejam-admin-reactions-list">
              {adminDetails.map((detail) => (
                <li key={`${gameId}-${detail.user_id}`}>
                  <span>{detail.user_prenom} {detail.user_nom}</span>
                  <span>{formatAdminReactions(detail)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Render a dynamic edition (from API)
  const renderDynamicEdition = (edition: GameJamEditionWithTeams) => {
    const podium = edition.equipes
      .filter(eq => eq.classement && eq.classement >= 1 && eq.classement <= 3)
      .sort((a, b) => (a.classement || 99) - (b.classement || 99));
    const otherGames = edition.equipes
      .filter(eq => !eq.classement || eq.classement > 3)
      .sort((a, b) => (a.classement || 999) - (b.classement || 999));

    return (
      <article key={edition.year} className="gamejam-year-block">
        <div className="gamejam-year-head">
          <h2>Edition {edition.year}</h2>
        </div>

        {podium.length > 0 && (
          <>
            <div className="gamejam-year-intro">
              <h3>Podium de la communaute</h3>
              <p>Trois projets mis en avant selon les votes et retours des etudiants.</p>
            </div>
            <div className="gamejam-podium-grid">
              {podium.map((equipe) => {
                const gameId = getTeamGameId(equipe.id);
                const rank = equipe.classement as 1 | 2 | 3;
                const liens = getTeamLinks(equipe.liens);
                const imageUrl = getTeamImageUrl(equipe.image_url);

                return (
                  <div key={gameId} className={`gamejam-card gamejam-rank-${rank}`}>
                    <div className="gamejam-rank-badge">{rankLabel[rank]}</div>
                    <div className="gamejam-image-placeholder">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={equipe.nom_jeu || equipe.nom}
                          className="gamejam-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="gamejam-image-empty">Pas d&apos;image</div>
                      )}
                    </div>
                    <div className="gamejam-card-content">
                      <h3>{equipe.nom_jeu || equipe.nom}</h3>
                      <p>{equipe.nom}</p>
                      {liens.length > 0 ? (
                        <a href={liens[0]} className="gamejam-link" target="_blank" rel="noreferrer">
                          Voir le GitHub
                        </a>
                      ) : (
                        <span className="gamejam-link gamejam-link-disabled">Pas de lien GitHub</span>
                      )}
                      {renderReactionBlock(edition.year, gameId)}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {otherGames.length > 0 && (
          <div className="gamejam-all-games">
            <div className="gamejam-all-games-head">
              <h3>Tous les jeux de l&apos;edition {edition.year}</h3>
              <p>Explore l&apos;ensemble des projets realises pendant la GameJam.</p>
            </div>
            <div className="gamejam-all-games-grid">
              {otherGames.map((equipe) => {
                const gameId = getTeamGameId(equipe.id);
                const liens = getTeamLinks(equipe.liens);
                const imageUrl = getTeamImageUrl(equipe.image_url);
                const topLabel = equipe.classement ? `Top ${equipe.classement}` : undefined;

                return (
                  <div key={gameId} className="gamejam-all-game-card">
                    {topLabel && <span className="gamejam-top-badge">{topLabel}</span>}
                    <div className="gamejam-all-game-image">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={equipe.nom_jeu || equipe.nom}
                          className="gamejam-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="gamejam-image-empty">Pas d&apos;image</div>
                      )}
                    </div>
                    <div className="gamejam-all-game-content">
                      <h4>{equipe.nom_jeu || equipe.nom}</h4>
                      <p>{equipe.nom}</p>
                      {liens.length > 0 ? (
                        <a href={liens[0]} className="gamejam-link" target="_blank" rel="noreferrer">
                          Voir le GitHub
                        </a>
                      ) : (
                        <span className="gamejam-link gamejam-link-disabled">Pas de lien GitHub</span>
                      )}
                      {renderReactionBlock(edition.year, gameId)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {podium.length === 0 && otherGames.length === 0 && (
          <div className="gamejam-year-intro">
            <p>Aucune equipe inscrite pour cette edition.</p>
          </div>
        )}
      </article>
    );
  };

  // Render a static edition (from data.ts)
  const renderStaticEdition = (edition: GameJamYear) => (
    <article key={edition.year} className="gamejam-year-block">
      <div className="gamejam-year-head">
        <h2>Edition {edition.year}</h2>
      </div>
      <div className="gamejam-year-intro">
        <h3>Podium de la communaute</h3>
        <p>Trois projets mis en avant selon les votes et retours des etudiants.</p>
      </div>
      <div className="gamejam-podium-grid">
        {edition.winners.map((winner) => (
          <div key={`${edition.year}-${winner.rank}`} className={`gamejam-card gamejam-rank-${winner.rank}`}>
            <div className="gamejam-rank-badge">{rankLabel[winner.rank]}</div>
            <div className="gamejam-image-placeholder">
              <Image
                src={getGameJamImagePath(winner.imageFile)}
                alt={winner.title}
                fill
                sizes="(max-width: 900px) 100vw, 33vw"
                className="gamejam-image"
              />
            </div>
            <div className="gamejam-card-content">
              <h3>{winner.title}</h3>
              <p>{winner.team}</p>
              {winner.githubUrl ? (
                <a href={winner.githubUrl} className="gamejam-link" target="_blank" rel="noreferrer">
                  Voir le GitHub
                </a>
              ) : (
                <span className="gamejam-link gamejam-link-disabled">Pas de lien GitHub</span>
              )}
              {renderReactionBlock(edition.year, winner.id)}
            </div>
          </div>
        ))}
      </div>

      <div className="gamejam-all-games">
        <div className="gamejam-all-games-head">
          <h3>Tous les jeux de l&apos;edition {edition.year}</h3>
          <p>Explore l&apos;ensemble des projets realises pendant la GameJam.</p>
        </div>
        <div className="gamejam-all-games-grid">
          {edition.allGames.map((game) => (
            <div key={game.id} className="gamejam-all-game-card">
              {game.topLabel && <span className="gamejam-top-badge">{game.topLabel}</span>}
              <div className="gamejam-all-game-image">
                <Image
                  src={getGameJamImagePath(game.imageFile)}
                  alt={game.title}
                  fill
                  sizes="(max-width: 900px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="gamejam-image"
                />
              </div>
              <div className="gamejam-all-game-content">
                <h4>{game.title}</h4>
                <p>{game.team}</p>
                {game.githubUrl ? (
                  <a href={game.githubUrl} className="gamejam-link" target="_blank" rel="noreferrer">
                    Voir le GitHub
                  </a>
                ) : (
                  <span className="gamejam-link gamejam-link-disabled">Pas de lien GitHub</span>
                )}
                {renderReactionBlock(edition.year, game.id)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );

  return (
    <section className="gamejam-page">
      <header className="gamejam-header">
        <span className="section-label">GAMEJAM</span>
        <h1 className="gamejam-title">Creer, partager, progresser</h1>
        <p className="gamejam-subtitle">
          La GameJam met la creation et l&apos;entraide au premier plan.
          Le podium met en avant les coups de coeur de la communaute. Testez aussi tous les jeux de chaque edition !
        </p>
        {(isLoadingReactions || loadingEditions) && <p className="gamejam-reaction-status">Chargement...</p>}
        {reactionError && <p className="gamejam-reaction-error">{reactionError}</p>}
      </header>

      <div className="gamejam-years">
        {/* Dynamic editions from API (newest first, excluding static ones) */}
        {uniqueDynamicEditions.map(renderDynamicEdition)}

        {/* Static editions from data.ts */}
        {staticEditions.map(renderStaticEdition)}
      </div>
    </section>
  );
}
