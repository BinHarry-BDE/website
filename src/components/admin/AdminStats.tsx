'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { IconUsers, IconUserCheck, IconTrendingUp, IconDollarSign, IconActivity, IconRefresh } from '@/components/Icons';
import type { AdminUserStats } from '@/types';

function BarChart({ data, labelKey, valueKey, color = '#1a1a2e', height = 200 }: {
  data: Array<Record<string, unknown>>;
  labelKey: string;
  valueKey: string;
  color?: string;
  height?: number;
}) {
  if (!data.length) return <div className="chart-empty">Aucune donnee</div>;

  const values = data.map(d => Number(d[valueKey]) || 0);
  const max = Math.max(...values, 1);
  const barWidth = Math.max(20, Math.min(60, (100 / data.length)));

  return (
    <div className="chart-container" style={{ height }}>
      <div className="chart-bars">
        {data.map((d, i) => {
          const val = Number(d[valueKey]) || 0;
          const pct = (val / max) * 100;
          const label = String(d[labelKey]);
          const shortLabel = label.length > 7 ? label.slice(5) : label;
          return (
            <div key={i} className="chart-bar-group" style={{ width: `${barWidth}%` }}>
              <span className="chart-bar-value">{val}</span>
              <div className="chart-bar" style={{ height: `${Math.max(pct, 4)}%`, background: color }} />
              <span className="chart-bar-label">{shortLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminStats() {
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [subStats, setSubStats] = useState<{ total: number; actifs: number; revenus: number; par_type: Array<{ type: string; count: number; total_prix: number }> } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

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

  useEffect(() => {
    loadStats();
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
          <BarChart
            data={stats?.registrationsPerMonth || []}
            labelKey="month"
            valueKey="count"
            color="#4f46e5"
          />
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IconActivity size={18} />
              Connexions (7 derniers jours)
            </h2>
          </div>
          <BarChart
            data={stats?.loginsPerDay || []}
            labelKey="day"
            valueKey="count"
            color="#059669"
          />
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
