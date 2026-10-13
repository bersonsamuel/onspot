'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';

export default function ProfileSetupModal() {
  const { activeModal, closeModal, userProfile, updateProfile } = useApp();

  const [name, setName] = useState(userProfile.name);
  const [phone, setPhone] = useState(userProfile.phone);
  const [city, setCity] = useState(userProfile.city);
  const [upiId, setUpiId] = useState(userProfile.upiId);

  useEffect(() => {
    if (activeModal === 'profile-modal') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(userProfile.name);
       
      setPhone(userProfile.phone);
       
      setCity(userProfile.city);
       
      setUpiId(userProfile.upiId);
    }
  }, [activeModal, userProfile]);

  if (activeModal !== 'profile-modal') {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      phone,
      city,
      upiId,
    });
    closeModal('profile-modal');
  };

  return (
    <div
      className={`modal-overlay ${activeModal === 'profile-modal' ? 'open' : ''}`}
      id="profile-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal('profile-modal');
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h3>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--mint-primary)"
              strokeWidth="2.5"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profile &amp; Payout Settings
          </h3>
          <button className="close-btn" aria-label="Close" onClick={() => closeModal('profile-modal')}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Legal Name</label>
            <input
              type="text"
              id="profile-name-input"
              className="form-control"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>WhatsApp Contact Number</label>
              <input
                type="text"
                id="profile-phone-input"
                className="form-control"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>City &amp; Preferred Locality</label>
              <input
                type="text"
                id="profile-city-input"
                className="form-control"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>UPI ID (For Instant Escrow Payout)</label>
            <input
              type="text"
              id="profile-upi-input"
              className="form-control"
              placeholder="e.g. mobile@upi"
              required
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>
          <div
            style={{
              background: 'rgba(0, 245, 155, 0.06)',
              border: '1px solid var(--border-mint)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            🛡️ <strong>OnSpot Shield:</strong> Verified profiles with registered UPI IDs receive
            instant escrow disbursement immediately upon shift sign-off.
          </div>
          <button
            type="submit"
            className="btn-action-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
          >
            Save &amp; Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}
