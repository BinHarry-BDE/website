'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Message } from '@/types';
import { IconStar, IconTrash, IconMailbox } from '@/components/Icons';

type TabType = 'inbox' | 'sent';

export default function DashboardMailbox() {
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setError('');

    const response = activeTab === 'inbox'
      ? await api.getMessages()
      : await api.getSentMessages();

    if (response.success && response.data) {
      setMessages(response.data.items);
    } else {
      setError(response.error || 'Erreur lors du chargement des messages');
    }
    setIsLoading(false);
  }, [activeTab]);

  const loadUnreadCount = useCallback(async () => {
    const response = await api.getUnreadCount();
    if (response.success && response.data) {
      setUnreadCount(response.data.count);
    }
  }, []);

  useEffect(() => {
    loadMessages();
    loadUnreadCount();
  }, [loadMessages, loadUnreadCount]);

  const handleSelectMessage = async (message: Message) => {
    const response = await api.getMessage(message.id);
    if (response.success && response.data) {
      setSelectedMessage(response.data);
      if (!message.lu && activeTab === 'inbox') {
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...m, lu: 1 } : m))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    }
  };

  const handleMarkImportant = async () => {
    if (!selectedMessage) return;
    const newImportant = !selectedMessage.important;
    const response = await api.markAsImportant(selectedMessage.id, newImportant);
    if (response.success) {
      setSelectedMessage({ ...selectedMessage, important: newImportant ? 1 : 0 });
      setMessages((prev) =>
        prev.map((m) => (m.id === selectedMessage.id ? { ...m, important: newImportant ? 1 : 0 } : m))
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage || !confirm('Supprimer ce message ?')) return;
    const response = await api.deleteMessage(selectedMessage.id);
    if (response.success) {
      setMessages((prev) => prev.filter((m) => m.id !== selectedMessage.id));
      setSelectedMessage(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  const getMessageFrom = (message: Message) => {
    if (message.type === 'system' || message.type === 'notification') {
      return 'BinHarry';
    }
    if (message.expediteur_nom && message.expediteur_prenom) {
      return `${message.expediteur_prenom} ${message.expediteur_nom}`;
    }
    return message.expediteur_email || 'Inconnu';
  };

  if (selectedMessage) {
    return (
      <div className="dashboard-card">
        <div className="message-detail">
          <div className="message-detail-header">
            <div className="message-detail-info">
              <h2>{selectedMessage.sujet}</h2>
              <div className="message-detail-meta">
                De: {getMessageFrom(selectedMessage)} •{' '}
                {new Date(selectedMessage.created_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            <div className="message-detail-actions">
              <button
                className={`btn btn-sm ${selectedMessage.important ? 'btn-danger' : 'btn-secondary'}`}
                onClick={handleMarkImportant}
                title={selectedMessage.important ? 'Retirer des importants' : 'Marquer comme important'}
              >
                <IconStar size={14} />
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                <IconTrash size={14} />
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedMessage(null)}>
                Retour
              </button>
            </div>
          </div>
          <div className="message-detail-content">{selectedMessage.contenu}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="mailbox-header">
        <div className="mailbox-tabs">
          <button
            className={`mailbox-tab ${activeTab === 'inbox' ? 'active' : ''}`}
            onClick={() => { setActiveTab('inbox'); setSelectedMessage(null); }}
          >
            Boîte de réception {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            className={`mailbox-tab ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => { setActiveTab('sent'); setSelectedMessage(null); }}
          >
            Envoyés
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-spinner" style={{ margin: '2rem auto' }} />
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconMailbox size={48} /></div>
          <h3>Aucun message</h3>
          <p>{activeTab === 'inbox' ? 'Votre boîte de réception est vide.' : 'Vous n\'avez envoyé aucun message.'}</p>
        </div>
      ) : (
        <div className="message-list">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-item ${!message.lu && activeTab === 'inbox' ? 'unread' : ''}`}
              onClick={() => handleSelectMessage(message)}
            >
              <div className="message-header">
                <span className="message-from">{getMessageFrom(message)}</span>
                <span className="message-date">{formatDate(message.created_at)}</span>
              </div>
              <div className="message-subject">{message.sujet}</div>
              <div className="message-preview">
                {message.contenu.substring(0, 100)}
                {message.contenu.length > 100 && '...'}
              </div>
              <div className="message-badges">
                {message.type !== 'normal' && (
                  <span className={`message-badge ${message.type}`}>{message.type}</span>
                )}
                {message.important === 1 && <span className="message-badge important">Important</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
