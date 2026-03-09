'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import type { MemberProfile } from '@/types';

interface ProfilePopupProps {
  memberId: number;
  children: React.ReactNode;
}

export default function ProfilePopup({ memberId, children }: ProfilePopupProps) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback(() => {
    setOpen((prev) => {
      if (!prev) {
        setLoading(true);
        api.getMemberProfile(memberId).then((res) => {
          if (res.success && res.data) setProfile(res.data);
          setLoading(false);
        });
      }
      return !prev;
    });
  }, [memberId]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const roleLabel = (role: string) => {
    switch (role) {
      case 'founder': return 'Fondateur';
      case 'admin': return 'Admin';
      default: return 'Membre';
    }
  };

  return (
    <div className="profile-popup-wrapper" ref={containerRef}>
      <div onClick={handleOpen} style={{ cursor: 'pointer' }}>
        {children}
      </div>
      {open && (
        <div className="profile-popup">
          {loading ? (
            <div className="profile-popup-loading">Chargement…</div>
          ) : profile ? (
            <>
              <div className="profile-popup-header">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={`${profile.prenom} ${profile.nom}`}
                    className="profile-popup-avatar"
                  />
                ) : (
                  <div className="profile-popup-avatar profile-popup-avatar-placeholder">
                    {profile.prenom[0]}{profile.nom[0]}
                  </div>
                )}
                <div>
                  <p className="profile-popup-name">{profile.prenom} {profile.nom}</p>
                  <span className={`profile-popup-role profile-popup-role-${profile.role}`}>
                    {roleLabel(profile.role)}
                  </span>
                </div>
              </div>
              <div className="profile-popup-info">
                <div className="profile-popup-row">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>Membre depuis {new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                </div>
                {profile.gamejam_team && (
                  <div className="profile-popup-row profile-popup-row-team">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span>
                      GameJam {profile.gamejam_team.edition_year} — {profile.gamejam_team.team_name}
                      {profile.gamejam_team.nom_jeu && <em> ({profile.gamejam_team.nom_jeu})</em>}
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="profile-popup-loading">Profil introuvable</div>
          )}
        </div>
      )}
    </div>
  );
}
