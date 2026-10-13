/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function TopHeader() {
  const {
    userRole,
    setUserRole,
    activeSection,
    openSection,
    resetFilters,
    toggleFilterChip,
    bookmarkedJobIds,
    userProfile,
    openProfileDrawer,
    openModal,
    showToast,
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="top-header">
      <div className="header-left">
        {/* Brand Logo */}
        <a
          href="#"
          className="brand-wrapper"
          onClick={(e) => {
            e.preventDefault();
            resetFilters();
          }}
        >
          <img
            src="/assets/onspot-logo-transparent.png"
            alt="OnSpot Logo"
            className="brand-logo-img"
            style={{
              height: '38px',
              width: 'auto',
              borderRadius: '8px',
              filter: 'drop-shadow(0 0 5px rgba(0, 245, 155, 0.4))',
              objectFit: 'contain',
            }}
          />
          <div className="brand-title">
            ONSPOT
            <span className="brand-badge">PRO</span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="nav-links desktop-nav">
          <a
            className={`nav-item ${activeSection === 'home' ? 'active' : ''}`}
            id="nav-home"
            onClick={() => {
              openSection('home');
              resetFilters();
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Home
          </a>

          <a
            className="nav-item"
            id="nav-my-shifts"
            onClick={() => {
              openSection('home');
              toggleFilterChip('today');
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span id="top-label-my">{userRole === 'seeker' ? 'My Shifts' : 'My Posts'}</span>
          </a>

          <a
            className="nav-item"
            id="nav-messages"
            onClick={() => openModal('chat-modal')}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            </svg>
            Messages
          </a>

          <a className="nav-item" id="nav-profile" onClick={openProfileDrawer}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Profile
          </a>

          <a
            className={`nav-item ${activeSection === 'other' ? 'active' : ''}`}
            id="nav-other"
            onClick={() => openSection('other')}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            Other
          </a>

          <a
            className={`nav-item ${activeSection === 'saved' ? 'active' : ''}`}
            id="nav-saved"
            onClick={() => openSection('saved')}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            Saved Jobs
            {bookmarkedJobIds.size > 0 && (
              <span
                id="saved-jobs-count-badge"
                style={{
                  display: 'inline-block',
                  marginLeft: '4px',
                  background: 'var(--mint-primary)',
                  color: '#000',
                  borderRadius: '10px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}
              >
                {bookmarkedJobIds.size}
              </span>
            )}
          </a>
        </nav>
      </div>

      {/* Header Right Quick Actions & Role Switcher */}
      <div className="header-right">
        {/* Role Switcher */}
        <div className="role-toggle-wrapper">
          <button
            className={`role-toggle-btn ${userRole === 'seeker' ? 'active' : ''}`}
            id="btn-seeker"
            onClick={() => {
              setUserRole('seeker');
              showToast('Switched to Worker / Seeker Mode');
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Seeker
          </button>
          <button
            className={`role-toggle-btn ${userRole === 'dealer' ? 'active' : ''}`}
            id="btn-dealer"
            onClick={() => {
              setUserRole('dealer');
              showToast('Switched to Employer / Dealer Mode');
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <rect width="20" height="14" x="2" y="7" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            Dealer
          </button>
        </div>

        <div className="notification-wrapper" style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            title="Notifications"
            id="btn-notification"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span
              className="badge-dot"
              id="notification-badge"
              style={{ display: 'none' }}
            ></span>
          </button>

          {/* Notification Dropdown Panel */}
          <div className={`notification-panel ${notifOpen ? 'open' : ''}`} id="notification-panel" style={{ display: notifOpen ? 'block' : 'none' }}>
            <div className="notification-header">
              <h4>NOTIFICATIONS</h4>
              <button
                className="icon-btn"
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'none',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setNotifOpen(false);
                  openModal('notification-preferences-modal');
                }}
                title="Notification Preferences"
              >
                ⚙️
              </button>
            </div>
            <div className="notification-list" id="notification-list">
              <div className="empty-notifications" id="empty-notifications">
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔔</div>
                <div
                  style={{
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                  }}
                >
                  No new notifications
                </div>
                <p>Notifications for your selected work categories will appear here.</p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="user-quick-profile desktop-nav"
          onClick={openProfileDrawer}
          title="Click to view full profile"
        >
          <img
            src={userProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
            className="user-avatar-mini"
            id="top-nav-avatar-img"
            alt="User"
          />
          <span className="user-quick-name display-username">{userProfile.name}</span>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* Mobile Hamburger Button */}
        <button className="mobile-menu-btn" onClick={openProfileDrawer}>
          ☰
        </button>
      </div>
    </header>
  );
}
