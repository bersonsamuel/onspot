'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

/**
 * PaymentModal — Shown for shifts that have a registration fee.
 *
 * This is a payout-confirmation screen, NOT a payment processor.
 * Workers get paid; they do not pay to apply.
 * The UPI field here records WHERE the worker wants to receive payout.
 *
 * Card/CVV fields were removed — we must never capture raw card data
 * through our own forms (PCI-DSS compliance).
 */
export default function PaymentModal() {
  const { activeModal, activeModalShift, closeModal, applyForJob, showToast, userProfile } = useApp();
  const [upiId, setUpiId] = useState(userProfile.upiId || '');
  const [confirming, setConfirming] = useState(false);

  if (activeModal !== 'payment-modal') return null;

  const handleConfirm = async () => {
    if (!upiId.trim() || !upiId.includes('@')) {
      showToast('⚠️ Please enter a valid UPI ID (e.g. name@okbank).');
      return;
    }

    setConfirming(true);
    try {
      if (activeModalShift) {
        await applyForJob(activeModalShift);
      }
      closeModal('payment-modal');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div
      className={`modal-overlay ${activeModal === 'payment-modal' ? 'open' : ''}`}
      id="payment-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm payout details"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal('payment-modal');
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h3>Confirm Payout Details</h3>
          <button className="close-btn" onClick={() => closeModal('payment-modal')} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Earnings summary */}
        <div style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>You will earn</div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--mint-primary)',
              fontFamily: '"Space Grotesk", sans-serif',
            }}
            id="payment-amount-display"
          >
            {activeModalShift?.pay || '₹0'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {activeModalShift?.instantPay ? '⚡ Instant UPI payout after shift' : 'Payout within 24 hours'}
          </div>
        </div>

        {/* UPI payout address */}
        <div className="form-group">
          <label htmlFor="payout-upi-id">Your UPI ID (for receiving payment)</label>
          <input
            type="text"
            className="form-control"
            id="payout-upi-id"
            placeholder="e.g. yourname@okbank"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            autoComplete="off"
            disabled={confirming}
          />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Payment will be sent to this UPI ID after you complete the shift.
          </div>
        </div>

        <button
          type="button"
          id="confirm-payout-btn"
          className="btn-action-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '8px' }}
          disabled={confirming}
          onClick={handleConfirm}
        >
          {confirming ? 'Confirming…' : 'Confirm & Apply'}
        </button>

        <div
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginTop: '10px',
          }}
        >
          🔒 Your UPI ID is stored securely and only shared with the employer after hiring.
        </div>
      </div>
    </div>
  );
}
