import type { ApiResponse, AuthResponse, User, PaginatedResponse, Message, Abonnement, UpdateUserData, PublicMember, Annonce } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  }

  // Auth
  async register(email: string, password: string, nom: string, prenom: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, nom, prenom }),
    });
  }

  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
    });
  }

  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
  }

  async sendVerificationEmail(): Promise<ApiResponse<void>> {
    return this.request<void>('/api/auth/send-verification', {
      method: 'POST',
    });
  }

  // Users
  async getMe(): Promise<ApiResponse<User>> {
    return this.request<User>('/api/users/me');
  }

  async updateProfile(data: { nom?: string; prenom?: string; avatar_url?: string }): Promise<ApiResponse<User>> {
    return this.request<User>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.request<void>('/api/users/me/password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }

  async deleteAccount(): Promise<ApiResponse<void>> {
    return this.request<void>('/api/users/me', {
      method: 'DELETE',
    });
  }

  // Admin - Users
  async getUsers(page = 1, limit = 20, search = '', role = ''): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    return this.request<PaginatedResponse<User>>(`/api/users?${params}`);
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    return this.request<User>(`/api/users/${id}`);
  }

  async updateUser(id: number, data: UpdateUserData): Promise<ApiResponse<User>> {
    return this.request<User>(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number, permanent = false): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/users/${id}?permanent=${permanent}`, {
      method: 'DELETE',
    });
  }

  // Messages
  async getMessages(page = 1, limit = 20, unread = false): Promise<ApiResponse<PaginatedResponse<Message>>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (unread) params.set('unread', 'true');
    return this.request<PaginatedResponse<Message>>(`/api/messages?${params}`);
  }

  async getSentMessages(page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Message>>> {
    return this.request<PaginatedResponse<Message>>(`/api/messages/sent?page=${page}&limit=${limit}`);
  }

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return this.request<{ count: number }>('/api/messages/unread/count');
  }

  async getMessage(id: number): Promise<ApiResponse<Message>> {
    return this.request<Message>(`/api/messages/${id}`);
  }

  async sendMessage(destinataireId: number, sujet: string, contenu: string): Promise<ApiResponse<void>> {
    return this.request<void>('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ destinataire_id: destinataireId, sujet, contenu }),
    });
  }

  async markAsRead(id: number, lu: boolean): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/messages/${id}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ lu }),
    });
  }

  async markAsImportant(id: number, important: boolean): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/messages/${id}/important`, {
      method: 'PATCH',
      body: JSON.stringify({ important }),
    });
  }

  async deleteMessage(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/messages/${id}`, {
      method: 'DELETE',
    });
  }

  async broadcastMessage(sujet: string, contenu: string): Promise<ApiResponse<void>> {
    return this.request<void>('/api/messages/broadcast', {
      method: 'POST',
      body: JSON.stringify({ sujet, contenu }),
    });
  }

  // Subscriptions
  async getMySubscriptions(page = 1, limit = 20, status = ''): Promise<ApiResponse<PaginatedResponse<Abonnement>>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    return this.request<PaginatedResponse<Abonnement>>(`/api/subscriptions/me?${params}`);
  }

  async getActiveSubscriptions(): Promise<ApiResponse<Abonnement[]>> {
    return this.request<Abonnement[]>('/api/subscriptions/me/active');
  }

  async cancelSubscription(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/subscriptions/me/${id}/cancel`, {
      method: 'POST',
    });
  }

  // Admin - Subscriptions
  async getAllSubscriptions(page = 1, limit = 20, status = '', type = '', userId = ''): Promise<ApiResponse<PaginatedResponse<Abonnement>>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    if (type) params.set('type', type);
    if (userId) params.set('user_id', userId);
    return this.request<PaginatedResponse<Abonnement>>(`/api/subscriptions?${params}`);
  }

  async createSubscription(data: {
    utilisateur_id: number;
    type: string;
    nom: string;
    description?: string;
    date_debut: string;
    date_fin?: string;
    prix: number;
  }): Promise<ApiResponse<void>> {
    return this.request<void>('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSubscription(id: number, data: Partial<Abonnement>): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/subscriptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSubscription(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/subscriptions/${id}`, {
      method: 'DELETE',
    });
  }

  async getSubscriptionStats(): Promise<ApiResponse<{
    total: number;
    actifs: number;
    revenus: number;
    par_type: Array<{ type: string; count: number; total_prix: number }>;
  }>> {
    return this.request('/api/subscriptions/stats');
  }

  // Public
  async getMembers(): Promise<ApiResponse<PublicMember[]>> {
    return this.request<PublicMember[]>('/api/public/members');
  }

  async getAnnonces(): Promise<ApiResponse<Annonce[]>> {
    return this.request<Annonce[]>('/api/public/annonces');
  }
}

export const api = new ApiClient(API_URL);
