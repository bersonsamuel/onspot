'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function LocationTrackerModal() {
  const { activeModal, closeModal, showToast } = useApp();

  if (activeModal !== 'location-tracker-modal') {
    return null;
  }

  const handleStopSharing = () => {
    closeModal('location-tracker-modal');
    showToast('Location sharing stopped.');
  };

  return (
    <div
      className={`modal-overlay ${activeModal === 'location-tracker-modal' ? 'open' : ''}`}
      id="location-tracker-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal('location-tracker-modal');
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h3>Worker Location</h3>
          <button className="close-btn" aria-label="Close" onClick={() => closeModal('location-tracker-modal')}>
            ✕
          </button>
        </div>
        <div
          style={{
            background: 'var(--bg-darkest)',
            borderRadius: 'var(--radius-md)',
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            border: '1px solid var(--border-subtle)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Mock Map Background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle, rgba(0, 245, 155, 0.1) 0%, rgba(4, 8, 6, 1) 100%)',
            }}
          />
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--mint-primary)"
            strokeWidth="2"
            style={{ position: 'absolute', top: '40%', left: '45%' }}
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span style={{ zIndex: 1, fontWeight: 700, color: 'var(--text-muted)' }}>
            Demo Map View
          </span>
        </div>

        <div className="drawer-info-item">
          <span className="info-label">Worker:</span>
          <span className="info-val" id="tracker-worker-name">
            Karthik Raja
          </span>
        </div>
        <div className="drawer-info-item">
          <span className="info-label">Status:</span>
          <span className="info-val" style={{ color: 'var(--mint-primary)' }}>
            🟢 On Shift
          </span>
        </div>
        <div className="drawer-info-item">
          <span className="info-label">Location:</span>
          <span className="info-val">Near Koyambedu</span>
        </div>
        <div className="drawer-info-item">
          <span className="info-label">Distance:</span>
          <span className="info-val">1.2 km from venue</span>
        </div>
        <div className="drawer-info-item">
          <span className="info-label">Last Updated:</span>
          <span className="info-val">2 minutes ago</span>
        </div>
        <div style={{ marginTop: '16px' }}>
          <button
            className="btn-cancel"
            style={{
              width: '100%',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
            }}
            onClick={handleStopSharing}
          >
            Stop Location Sharing
          </button>
        </div>
      </div>
    </div>
  );
}
