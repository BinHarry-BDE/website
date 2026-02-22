'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-content">
        <Link href="/" className="navbar-logo">
          <Image 
            src="/asset/BinHarry.png" 
            alt="Logo BinHarry" 
            width={40} 
            height={40}
            className="navbar-logo-img"
          />
          BinHarry
        </Link>
        
        <nav className="navbar-nav">
          <Link href="/">Accueil</Link>
          <Link href="/gamejam">GameJam</Link>
          <Link href="/boutique">Boutique</Link>
          
          <div className="navbar-user" ref={dropdownRef}>
            {isLoading ? (
              <span className="navbar-loading">...</span>
            ) : isAuthenticated && user ? (
              <>
                <button 
                  className="navbar-user-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                >
                  <span className="navbar-avatar">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={`${user.prenom} ${user.nom}`} />
                    ) : (
                      <>{user.prenom[0]}{user.nom[0]}</>
                    )}
                  </span>
                  <span className="navbar-username">{user.prenom}</span>
                  <svg className="navbar-chevron" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
                
                {dropdownOpen && (
                  <div className="navbar-dropdown">
                    <div className="navbar-dropdown-header">
                      <strong>{user.prenom} {user.nom}</strong>
                      <span>{user.email}</span>
                      {user.role === 'founder' && <span className="admin-badge founder-badge">Founder</span>}
                      {user.role === 'admin' && <span className="admin-badge">Admin</span>}
                    </div>
                    <div className="navbar-dropdown-divider" />
                    <Link 
                      href="/dashboard" 
                      className="navbar-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Mon tableau de bord
                    </Link>
                    {(user.role === 'admin' || user.role === 'founder') && (
                      <Link 
                        href="/admin" 
                        className="navbar-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Administration
                      </Link>
                    )}
                    <div className="navbar-dropdown-divider" />
                    <button 
                      className="navbar-dropdown-item navbar-logout"
                      onClick={handleLogout}
                    >
                      Se déconnecter
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link href="/auth" className="navbar-auth-btn">
                Connexion
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
