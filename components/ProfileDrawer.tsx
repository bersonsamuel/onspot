/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function ProfileDrawer() {
  const {
    isProfileDrawerOpen,
    closeProfileDrawer,
    userProfile,
    completedJobs,
    bookmarkedJobIds,
    shifts,
    dealerPosts,
    isAuthenticated,
    openSection,
    openModal,
    openSettingsDrawer,
    showToast,
    logout,
  } = useApp();

  if (!isProfileDrawerOpen) return null;

  const allJobs = [...shifts, ...dealerPosts];
  const savedJobs = allJobs.filter((j) => bookmarkedJobIds.has(j.id)).slice(0, 3);

  return (
    <>
      <div
        className="drawer-backdrop open"
        id="drawer-backdrop"
        onClick={closeProfileDrawer}
      ></div>
      <aside
        className="profile-drawer open"
        id="profile-drawer"
        aria-label="Profile Details Panel"
      >
        <div className="drawer-header">
          <div className="drawer-title">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--mint-primary)"
              strokeWidth="2.5"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            User Profile & Status
          </div>
          <button
            className="close-btn" aria-label="Close"
            onClick={closeProfileDrawer}
            title="Close profile drawer"
          >
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {/* Profile Highlight */}
          <div className="drawer-profile-card">
            <div
              className="avatar-wrapper"
              onClick={() => {
                closeProfileDrawer();
                openModal('camera-modal');
              }}
              style={{ cursor: 'pointer', position: 'relative' }}
              title="Update Profile Photo"
            >
              <img
                src={
                  userProfile.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'
                }
                className="avatar-large"
                id="drawer-avatar-img"
                alt="Profile"
              />
              <div className="verified-badge" title="KYC & Aadhar Verified">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="var(--mint-primary)"
                  stroke="#000"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0, 0, 0, 0.8)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  color: 'var(--mint-primary)',
                  whiteSpace: 'nowrap',
                  border: '1px solid var(--border-mint)',
                }}
              >
                📷 Edit
              </div>
            </div>
            <div className="profile-name display-username">{userProfile.name}</div>
            <div className="profile-sub">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span id="drawer-city">{userProfile.city}</span>
            </div>
            <div>
              <span className="rating-pill" id="user-rating-box">
                ★ {userProfile.rating} ({completedJobs.length} Gigs Completed)
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="drawer-stats-grid">
            <div className="stat-item">
              <div className="stat-num" id="drawer-completed-count">
                {completedJobs.length}
              </div>
              <div className="stat-label">Completed Jobs</div>
            </div>
            <div className="stat-item">
              <div className="stat-num" style={{ color: 'var(--mint-primary)' }}>
                ★ {userProfile.rating || '—'}
              </div>
              <div className="stat-label">Rating</div>
            </div>
          </div>

          {/* Completed Work History */}
          <div className="drawer-info-card">
            <div
              className="drawer-card-title"
              id="completed-work-title"
              style={{ display: 'flex' }}
            >
              MY COMPLETED WORK{' '}
              <span
                style={{
                  color: 'var(--mint-primary)',
                  fontSize: '12px',
                  marginLeft: 'auto',
                  textTransform: 'none',
                }}
              >
                ✓ {completedJobs.length} Works Completed
              </span>
            </div>
            <div className="my-applications-list" id="completed-work-list">
              {completedJobs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '10px 0' }}>
                  No completed jobs yet. Complete shifts to build your verified record!
                </div>
              ) : (
                completedJobs.map((job) => (
                  <div key={job.id} className="app-card-item">
                    <div style={{ fontWeight: 600 }}>{job.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {job.loc} • {job.date}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Other / All Works */}
          <div
            className="drawer-info-card"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              closeProfileDrawer();
              openSection('other');
            }}
          >
            <div
              className="drawer-card-title"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Other / All Categories</span>
              <span>›</span>
            </div>
          </div>

          {/* Saved Jobs */}
          <div className="drawer-info-card">
            <div
              className="drawer-card-title"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => {
                closeProfileDrawer();
                openSection('saved');
              }}
            >
              <span>Saved Jobs ({bookmarkedJobIds.size})</span>
              <span>View All ›</span>
            </div>
            <div className="my-applications-list" id="saved-jobs-list">
              {savedJobs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '8px 0' }}>
                  No saved jobs yet.
                </div>
              ) : (
                savedJobs.map((j) => (
                  <div
                    key={j.id}
                    style={{
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      closeProfileDrawer();
                      openModal('shift-modal', j);
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {j.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--mint-primary)' }}>
                      {j.pay} • {j.loc}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* KYC & Verification Details */}
          <div className="drawer-info-card">
            <div className="drawer-card-title">Identity & Verification</div>
            <div className="drawer-info-row">
              <div className="info-tag-verified">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Aadhar & Biometrics Verified
              </div>
            </div>
            <div className="drawer-info-item">
              <span className="info-label">WhatsApp Number:</span>
              <span className="info-val" id="drawer-phone">
                {userProfile.phone}
              </span>
            </div>
          </div>

          {/* Earnings & Wallet Information */}
          <div className="drawer-info-card">
            <div className="drawer-card-title">Earnings & Instant Escrow</div>
            <div className="wallet-balance-box">
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  Available Balance
                </div>
                <div className="wallet-num">
                  ₹{(userProfile.walletBalance ?? 0).toLocaleString('en-IN')}
                </div>
              </div>
              <button
                className="btn-wallet-withdraw"
                onClick={() =>
                  showToast('Instant UPI payout initiated to your registered VPA!')
                }
              >
                Withdraw
              </button>
            </div>
            <div className="drawer-info-item" style={{ marginTop: '10px' }}>
              <span className="info-label">Linked UPI ID:</span>
              <span className="info-val" id="drawer-upi">
                {userProfile.upiId}
              </span>
            </div>
            <div className="drawer-info-item">
              <span className="info-label">Disbursement:</span>
              <span className="info-val" style={{ color: 'var(--mint-primary)' }}>
                Instant on Shift Sign-off ⚡
              </span>
            </div>
          </div>

          {/* Profile Update Action & Auth */}
          <div
            style={{
              marginTop: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <button
              className="btn-action-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
              onClick={() => {
                closeProfileDrawer();
                openModal('profile-modal');
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
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Edit Profile
            </button>
            <button
              className="btn-secondary-sidebar"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '11px',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                background: 'var(--bg-elevated)',
              }}
              onClick={() => {
                closeProfileDrawer();
                openSettingsDrawer();
              }}
            >
              ⚙️ Settings
            </button>
            {!isAuthenticated ? (
              <button
                className="btn-details"
                style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
                id="login-btn-action"
                onClick={() => {
                  closeProfileDrawer();
                  openModal('login-modal');
                }}
              >
                Login
              </button>
            ) : (
              <button
                className="btn-cancel"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '11px',
                  color: 'var(--danger)',
                }}
                id="logout-btn-action"
                onClick={logout}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
