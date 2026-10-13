'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function LegalModal() {
  const { activeModal, closeModal } = useApp();

  if (activeModal !== 'legal-modal') {
    return null;
  }

  return (
    <div
      className={`modal-overlay ${activeModal === 'legal-modal' ? 'open' : ''}`}
      id="legal-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal('legal-modal');
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h3 id="legal-modal-title">Terms &amp; Conditions</h3>
          <button className="close-btn" aria-label="Close" onClick={() => closeModal('legal-modal')}>
            ✕
          </button>
        </div>
        <div className="legal-modal-content">
          <h4>1. Introduction</h4>
          <p>
            Welcome to OnSpot. By using our application, you agree to these Terms and
            Conditions. Please read them carefully.
          </p>
          <h4>2. User Eligibility</h4>
          <p>
            You must be at least 18 years old to use the platform. By creating an account,
            you represent and warrant that you are eligible.
          </p>
          <h4>3. Account Responsibilities</h4>
          <p>
            You are responsible for maintaining the confidentiality of your account
            credentials and for all activities that occur under your account.
          </p>
          <h4>4. Job Listings &amp; Applications</h4>
          <p>
            Dealers must provide accurate information. Seekers must fulfill jobs they apply
            and are selected for. Failure to show up may result in account suspension.
          </p>
          <h4>5. Payments &amp; Refunds</h4>
          <p>
            Payments are processed securely via our escrow system. Refunds are subject to our
            Payment &amp; Refund Policy. Instant payouts occur upon shift sign-off.
          </p>
          <h4>6. User Conduct &amp; Safety</h4>
          <p>
            Users must behave professionally. Harassment, discrimination, or sharing false
            information will result in immediate termination of the account.
          </p>
          <h4>7. Limitation of Liability</h4>
          <p>
            OnSpot is a platform connecting seekers and dealers. We are not liable for disputes
            arising directly between parties during a shift.
          </p>
        </div>
        <div
          style={{
            marginTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '16px',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontSize: '13px',
            }}
          >
            <input
              type="checkbox"
              id="legal-agree-check"
              style={{
                width: '18px',
                height: '18px',
                accentColor: 'var(--mint-primary)',
              }}
            />
            I have read and understood the Terms &amp; Conditions.
          </label>
          <button
            type="button"
            className="btn-action-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '11px',
              marginTop: '12px',
            }}
            onClick={() => closeModal('legal-modal')}
          >
            Accept &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
}
