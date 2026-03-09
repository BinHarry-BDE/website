// Types pour le frontend
export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: 'user' | 'admin' | 'founder';
  avatar_url: string | null;
  email_verified: number;
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

export interface PublicMember {
  id: number;
  prenom: string;
  nom: string;
  avatar_url: string | null;
  created_at: string;
}

export interface BDEMember {
  id: number;
  prenom: string;
  nom: string;
  avatar_url: string | null;
  role: 'admin' | 'founder';
  created_at: string;
}

export interface Annonce {
  id: number;
  titre: string;
  contenu: string;
  image_url: string | null;
  date_evenement: string | null;
  created_at: string;
  auteur_prenom: string | null;
  auteur_nom: string | null;
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

// Type pour les statistiques admin détaillées
export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  verifiedUsers: number;
  adherents: number;
  registrationsPerMonth: Array<{ month: string; count: number }>;
  registrationsPerDay: Array<{ day: string; count: number }>;
  loginsPerDay: Array<{ day: string; count: number }>;
  recentUsers: Array<User & { last_login: string | null }>;
}

// User étendu pour l'admin (avec last_login)
export interface AdminUser extends User {
  last_login: string | null;
}

export type GameJamReactionType = 'like' | 'dislike' | 'heart';

export interface GameJamReactionSummary {
  game_id: string;
  likes: number;
  dislikes: number;
  hearts: number;
}

export interface GameJamUserReaction {
  game_id: string;
  like: boolean;
  dislike: boolean;
  heart: boolean;
}

export interface GameJamAdminDetail {
  game_id: string;
  user_id: number;
  user_nom: string;
  user_prenom: string;
  like: boolean;
  dislike: boolean;
  heart: boolean;
  updated_at: string;
}

export interface GameJamReactionsPayload {
  edition_year: string;
  summaries: GameJamReactionSummary[];
  userReactions: GameJamUserReaction[];
  adminDetails: GameJamAdminDetail[];
}

// GameJam Editions & Teams
export interface GameJamEdition {
  id: number;
  year: string;
  theme: string | null;
  description: string | null;
  date_debut: string | null;
  date_fin: string | null;
  is_active: number;
  created_at: string;
}

export interface GameJamEquipeMember {
  id: number;
  nom: string;
  prenom: string;
  avatar_url: string | null;
}

export interface GameJamEquipe {
  id: number;
  edition_year: string;
  nom: string;
  nom_jeu: string | null;
  description: string | null;
  image_url: string | null;
  liens: string; // JSON string
  classement: number | null;
  created_at: string;
  updated_at: string;
  membres: GameJamEquipeMember[];
}

export interface GameJamEditionWithTeams extends GameJamEdition {
  equipes: GameJamEquipe[];
}

export interface MemberProfile {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  avatar_url: string | null;
  role: 'user' | 'admin' | 'founder';
  created_at: string;
  gamejam_team: {
    team_name: string;
    nom_jeu: string | null;
    edition_year: string;
  } | null;
}
