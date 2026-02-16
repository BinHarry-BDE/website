'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminSubscriptions from '@/components/admin/AdminSubscriptions';
import AdminBroadcast from '@/components/admin/AdminBroadcast';
import AdminStats from '@/components/admin/AdminStats';
import { IconBarChart, IconUsers, IconCreditCard, IconMegaphone, IconArrowLeft, IconShield } from '@/components/Icons';
import '../dashboard/dashboard.css';
import './admin.css';

type TabType = 'stats' | 'users' | 'subscriptions' | 'broadcast';

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('stats');

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth');
      } else if (user?.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Chargement...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'stats', label: 'Statistiques', icon: <IconBarChart size={18} /> },
    { id: 'users', label: 'Utilisateurs', icon: <IconUsers size={18} /> },
    { id: 'subscriptions', label: 'Abonnements', icon: <IconCreditCard size={18} /> },
    { id: 'broadcast', label: 'Annonces', icon: <IconMegaphone size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <AdminStats />;
      case 'users':
        return <AdminUsers />;
      case 'subscriptions':
        return <AdminSubscriptions />;
      case 'broadcast':
        return <AdminBroadcast />;
      default:
        return <AdminStats />;
    }
  };

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar admin-sidebar">
        <div className="dashboard-sidebar-header">
          <div className="dashboard-user-avatar admin-avatar">
            <IconShield size={20} />
          </div>
          <div className="dashboard-user-info">
            <strong>Administration</strong>
            <span>Panel admin BinHarry</span>
          </div>
        </div>

        <nav className="dashboard-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`dashboard-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="dashboard-nav-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="admin-back-link">
          <button
            className="dashboard-nav-item"
            onClick={() => router.push('/dashboard')}
          >
            <span className="dashboard-nav-icon"><IconArrowLeft size={18} /></span>
            Mon espace
          </button>
        </div>
      </aside>

      <main className="dashboard-content">
        <h1 className="dashboard-title">
          <span className="admin-badge-title">Admin</span>
          {tabs.find(t => t.id === activeTab)?.label}
        </h1>
        {renderContent()}
      </main>
    </div>
  );
}
