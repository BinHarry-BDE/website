// Types pour le frontend
export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: 'user' | 'admin';
  avatar_url: string | null;
  created_at: string;
  is_active: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Message {
  id: number;
  expediteur_id: number | null;
  destinataire_id: number;
  sujet: string;
  contenu: string;
  lu: number;
  important: number;
  type: 'normal' | 'system' | 'notification';
  created_at: string;
  expediteur_nom?: string;
  expediteur_prenom?: string;
  expediteur_email?: string;
}

export interface Abonnement {
  id: number;
  utilisateur_id: number;
  type: 'mensuel' | 'annuel' | 'evenement';
  nom: string;
  description: string | null;
  date_debut: string;
  date_fin: string | null;
  prix: number;
  statut: 'actif' | 'expire' | 'annule';
  created_at: string;
}

// Type pour la mise à jour d'un utilisateur (admin)
export interface UpdateUserData {
  nom?: string;
  prenom?: string;
  email?: string;
  avatar_url?: string | null;
  is_active?: boolean;
  role?: 'user' | 'admin';
}
