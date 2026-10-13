'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function DeleteAccountModal() {
  const { activeModal, closeModal, closeSettingsDrawer, showToast, logout } = useApp();

  if (activeModal !== 'delete-account-modal') {
    return null;
  }

  const handleDelete = () => {
    showToast('Account deletion request submitted.');
    closeModal('delete-account-modal');
    closeSettingsDrawer();
    logout();
  };

  return (
    <div
      className={`modal-overlay ${activeModal === 'delete-account-modal' ? 'open' : ''}`}
      id="delete-account-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal('delete-account-modal');
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h3>Delete Account?</h3>
          <button className="close-btn" aria-label="Close" onClick={() => closeModal('delete-account-modal')}>
            ✕
          </button>
        </div>
        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            fontSize: '14px',
          }}
        >
          This action cannot be easily undone. All your data, job history, and preferences will be permanently removed.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-cancel"
            style={{ flex: 1 }}
            onClick={() => closeModal('delete-account-modal')}
          >
            Cancel
          </button>
          <button
            className="btn-action-primary"
            style={{
              flex: 1,
              justifyContent: 'center',
              background: 'var(--danger)',
              borderColor: 'var(--danger)',
              boxShadow: '0 0 16px rgba(244, 63, 94, 0.4)',
            }}
            onClick={handleDelete}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
