'use client';

import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';
import { IconUsers, IconUserCheck, IconTrendingUp, IconDollarSign, IconActivity, IconRefresh } from '@/components/Icons';
import type { AdminUserStats } from '@/types';

function formatChartDate(rawLabel: string): string {
  if (/^\d{4}-\d{2}$/.test(rawLabel)) {
    const [year, month] = rawLabel.split('-').map(Number);
    const date = new Date(year, (month || 1) - 1, 1);
    return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(rawLabel)) {
    const date = new Date(rawLabel);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  }

  return rawLabel;
}

function fillMissingDates(data: any[], key: string): any[] {
  if (data.length === 0) return [];
  if (data.length === 1) return data;

  const filled: any[] = [];
  const startDate = new Date(data[0][key]);
  const endDate = new Date(data[data.length - 1][key]);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const existing = data.find(item => item[key] === dateStr);
    filled.push(existing || { [key]: dateStr, count: 0 });
  }

  return filled;
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{formatChartDate(String(data.payload.month || data.payload.day))}</p>
        <p className="chart-tooltip-value">{data.value} inscription{data.value > 1 ? 's' : ''}</p>
      </div>
    );
  }
  return null;
}

function CustomLoginTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{formatChartDate(String(data.payload.day))}</p>
        <p className="chart-tooltip-value">{data.value} connexion{data.value > 1 ? 's' : ''}</p>
      </div>
    );
  }
  return null;
}

export default function AdminStats() {
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [subStats, setSubStats] = useState<{ total: number; actifs: number; revenus: number; par_type: Array<{ type: string; count: number; total_prix: number }> } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    const [userStatsRes, subStatsRes] = await Promise.all([
      api.getUserStats(),
      api.getSubscriptionStats(),
    ]);

    if (userStatsRes.success && userStatsRes.data) {
      setStats(userStatsRes.data);
    }
    if (subStatsRes.success && subStatsRes.data) {
      setSubStats(subStatsRes.data);
    }
    setLastRefresh(new Date());
    setIsLoading(false);
  }, []);

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    loadStats();
    
    const interval = setInterval(() => {
      loadStats();
    }, 30000); // 30 secondes
    
    setAutoRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadStats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="dashboard-card">
        <div className="loading-spinner" style={{ margin: '2rem auto' }} />
      </div>
    );
  }

  return (
    <>
      <div className="stats-header">
        <span className="stats-refresh-info">
          Derniere mise a jour : {formatTime(lastRefresh)}
        </span>
        <button className="btn btn-secondary btn-sm" onClick={loadStats}>
          <IconRefresh size={16} /> Actualiser
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <IconUsers size={24} />
          </div>
          <div className="stat-card-content">
            <div className="stat-value">{stats?.totalUsers || 0}</div>
            <div className="stat-label">Utilisateurs inscrits</div>
            <div className="stat-sub">{stats?.activeUsers || 0} actifs</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <IconUserCheck size={24} />
          </div>
          <div className="stat-card-content">
            <div className="stat-value">{stats?.adherents || 0}</div>
            <div className="stat-label">Adherents BDE</div>
            <div className="stat-sub">{stats?.verifiedUsers || 0} emails verifies</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <IconActivity size={24} />
          </div>
          <div className="stat-card-content">
            <div className="stat-value">{subStats?.actifs || 0}</div>
            <div className="stat-label">Abonnements actifs</div>
            <div className="stat-sub">{subStats?.total || 0} au total</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fce7f3', color: '#db2777' }}>
            <IconDollarSign size={24} />
          </div>
          <div className="stat-card-content">
            <div className="stat-value">{formatCurrency(subStats?.revenus || 0)}</div>
            <div className="stat-label">Revenus totaux</div>
            <div className="stat-sub">{stats?.adminUsers || 0} admin{(stats?.adminUsers || 0) > 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      <div className="stats-charts-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IconTrendingUp size={18} />
              Inscriptions par mois
            </h2>
          </div>
          {(stats?.registrationsPerMonth || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats?.registrationsPerMonth || []} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={formatChartDate}
                  stroke="#d1d5db"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#d1d5db" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4f46e5', strokeWidth: 2 }} />
                <Line 
                  type="natural" 
                  dataKey="count" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  dot={{ fill: '#4f46e5', r: 5, strokeWidth: 2, stroke: 'white' }}
                  activeDot={{ r: 7 }}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Aucune donnée</div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IconActivity size={18} />
              Connexions (7 derniers jours)
            </h2>
          </div>
          {(stats?.loginsPerDay || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={fillMissingDates(stats?.loginsPerDay || [], 'day')} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  tickFormatter={formatChartDate}
                  stroke="#d1d5db"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#d1d5db" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomLoginTooltip />} cursor={{ stroke: '#059669', strokeWidth: 2 }} />
                <Line 
                  type="natural" 
                  dataKey="count" 
                  stroke="#059669" 
                  strokeWidth={3}
                  dot={{ fill: '#059669', r: 5, strokeWidth: 2, stroke: 'white' }}
                  activeDot={{ r: 7 }}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Aucune donnée</div>
          )}
        </div>
      </div>

      {subStats?.par_type && subStats.par_type.length > 0 && (
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IconDollarSign size={18} />
              Abonnements par type
            </h2>
          </div>
          <div className="sub-type-grid">
            {subStats.par_type.map((t) => (
              <div key={t.type} className="sub-type-card">
                <div className="sub-type-name">{t.type}</div>
                <div className="sub-type-count">{t.count} actif{t.count > 1 ? 's' : ''}</div>
                <div className="sub-type-revenue">{formatCurrency(t.total_prix)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconUsers size={18} />
            Derniers inscrits
          </h2>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Role</th>
                <th>Inscrit le</th>
                <th>Derniere connexion</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentUsers || []).map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600 }}>
                          {u.prenom[0]}{u.nom[0]}
                        </div>
                      )}
                      <strong>{u.prenom} {u.nom}</strong>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                  <td>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>{u.last_login ? new Date(u.last_login).toLocaleDateString('fr-FR') : 'Jamais'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
