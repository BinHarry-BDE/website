'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = (h * maxSize) / w; w = maxSize; }
          else { w = (w * maxSize) / h; h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas error'));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DashboardProfile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [nom, setNom] = useState(user?.nom || '');
  const [prenom, setPrenom] = useState(user?.prenom || '');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const response = await api.updateProfile({ nom, prenom });

    if (response.success && response.data) {
      updateUser(response.data);
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
      setIsEditing(false);
    } else {
      setMessage({ type: 'error', text: response.error || 'Erreur lors de la mise à jour' });
    }

    setIsLoading(false);
  };

  const handleCancel = () => {
    setNom(user.nom);
    setPrenom(user.prenom);
    setIsEditing(false);
    setMessage(null);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une image' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'L\'image ne doit pas dépasser 2 Mo' });
      return;
    }

    setAvatarLoading(true);
    setMessage(null);

    try {
      const dataUrl = await resizeImage(file, 200);
      const response = await api.updateProfile({ avatar_url: dataUrl });

      if (response.success && response.data) {
        updateUser(response.data);
        setMessage({ type: 'success', text: 'Photo de profil mise à jour' });
      } else {
        setMessage({ type: 'error', text: response.error || 'Erreur lors de la mise à jour' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors du traitement de l\'image' });
    }

    setAvatarLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAvatar = async () => {
    setAvatarLoading(true);
    setMessage(null);
    const response = await api.updateProfile({ avatar_url: '' });
    if (response.success && response.data) {
      updateUser(response.data);
      setMessage({ type: 'success', text: 'Photo de profil supprimée' });
    }
    setAvatarLoading(false);
  };

  return (
    <>
      {/* Avatar Card */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2>Photo de profil</h2>
        </div>
        <div className="avatar-section">
          <div className="avatar-preview">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="avatar-img" />
            ) : (
              <span className="avatar-initials">
                {user.prenom[0]}{user.nom[0]}
              </span>
            )}
          </div>
          <div className="avatar-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
              id="avatar-upload"
            />
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
            >
              {avatarLoading ? 'Envoi...' : 'Changer la photo'}
            </button>
            {user.avatar_url && (
              <button
                className="btn btn-sm"
                onClick={handleRemoveAvatar}
                disabled={avatarLoading}
                style={{ color: '#dc2626', background: 'none', padding: '0.5rem' }}
              >
                Supprimer
              </button>
            )}
            <p className="avatar-hint">JPG, PNG. Max 2 Mo.</p>
          </div>
        </div>
      </div>

      {/* Profile Info Card */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2>Informations personnelles</h2>
          {!isEditing && (
            <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(true)}>
              Modifier
            </button>
          )}
        </div>

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="dashboard-form">
            <div className="dashboard-form-row">
              <div className="dashboard-form-group">
                <label htmlFor="prenom">Prénom</label>
                <input
                  type="text"
                  id="prenom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  required
                />
              </div>
              <div className="dashboard-form-group">
                <label htmlFor="nom">Nom</label>
                <input
                  type="text"
                  id="nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="dashboard-form-group">
              <label>Email</label>
              <input type="email" value={user.email} disabled />
              <small style={{ color: '#888' }}>L&apos;email ne peut pas être modifié</small>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="profile-field">
              <span className="profile-label">Nom complet</span>
              <span className="profile-value">{user.prenom} {user.nom}</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Email</span>
              <span className="profile-value">
                {user.email}
                {user.email_verified ? (
                  <span className="email-verified-badge">&check; Vérifié</span>
                ) : (
                  <span className="email-unverified-badge">Non vérifié</span>
                )}
              </span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Rôle</span>
              <span className="profile-value" style={{ textTransform: 'capitalize' }}>{user.role}</span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Membre depuis</span>
              <span className="profile-value">
                {new Date(user.created_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}

        <style jsx>{`
          .profile-info {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .profile-field {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }
          .profile-label {
            font-size: 0.85rem;
            color: #666;
          }
          .profile-value {
            font-size: 1rem;
            color: #1a1a2e;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
          }
          .email-verified-badge {
            background: #d1fae5;
            color: #059669;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
          }
          .email-unverified-badge {
            background: #fef3c7;
            color: #b45309;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
          }
          .avatar-section {
            display: flex;
            align-items: center;
            gap: 1.5rem;
          }
          .avatar-preview {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #5865F2, #7c3aed);
            color: white;
            font-size: 1.5rem;
            font-weight: 700;
            text-transform: uppercase;
          }
          .avatar-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .avatar-initials {
            line-height: 1;
          }
          .avatar-actions {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }
          .avatar-hint {
            font-size: 0.8rem;
            color: #94a3b8;
            margin: 0;
          }
        `}</style>
      </div>
    </>
  );
}
