'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardProfile from '@/components/dashboard/DashboardProfile';
import DashboardSubscriptions from '@/components/dashboard/DashboardSubscriptions';
import DashboardMailbox from '@/components/dashboard/DashboardMailbox';
import DashboardSettings from '@/components/dashboard/DashboardSettings';
import './dashboard.css';

type TabType = 'profile' | 'subscriptions' | 'mailbox' | 'settings';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'profile', label: 'Mon profil', icon: '👤' },
    { id: 'subscriptions', label: 'Abonnements', icon: '💳' },
    { id: 'mailbox', label: 'Messagerie', icon: '📬' },
    { id: 'settings', label: 'Paramètres', icon: '⚙️' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <DashboardProfile />;
      case 'subscriptions':
        return <DashboardSubscriptions />;
      case 'mailbox':
        return <DashboardMailbox />;
      case 'settings':
        return <DashboardSettings />;
      default:
        return <DashboardProfile />;
    }
  };

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <div className="dashboard-user-avatar">
            {user.prenom[0]}{user.nom[0]}
          </div>
          <div className="dashboard-user-info">
            <strong>{user.prenom} {user.nom}</strong>
            <span>{user.email}</span>
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
      </aside>

      <main className="dashboard-content">
        <h1 className="dashboard-title">{tabs.find(t => t.id === activeTab)?.label}</h1>
        {renderContent()}
      </main>
    </div>
  );
}
