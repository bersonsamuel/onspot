'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CATEGORIES } from '@/lib/initialData';

export default function NotificationPreferencesModal() {
  const { activeModal, closeModal, showToast } = useApp();

  const [inApp, setInApp] = useState(true);
  const [sms, setSms] = useState(false);
  const [push, setPush] = useState(false);

  const [allCategoriesSelected, setAllCategoriesSelected] = useState(true);
  const nonAllCategories = CATEGORIES.filter((c) => c.key !== 'All');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(nonAllCategories.map((c) => c.key))
  );

  if (activeModal !== 'notification-prefs-modal') {
    return null;
  }

  const handleToggleAll = () => {
    if (allCategoriesSelected) {
      setAllCategoriesSelected(false);
      setSelectedCategories(new Set());
    } else {
      setAllCategoriesSelected(true);
      setSelectedCategories(new Set(nonAllCategories.map((c) => c.key)));
    }
  };

  const handleToggleCategory = (catKey: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catKey)) next.delete(catKey);
      else next.add(catKey);
      setAllCategoriesSelected(next.size === nonAllCategories.length);
      return next;
    });
  };

  const handleSave = () => {
    showToast('Notification preferences saved!');
    closeModal('notification-prefs-modal');
  };

  return (
    <div
      className={`modal-overlay ${activeModal === 'notification-prefs-modal' ? 'open' : ''}`}
      id="notification-prefs-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal('notification-prefs-modal');
      }}
    >
      <div
        className="modal-card"
        style={{
          maxWidth: '400px',
          height: '85vh',
          maxHeight: '600px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="modal-header">
          <h3>⚙️ Notification Preferences</h3>
          <button className="close-btn" aria-label="Close" onClick={() => closeModal('notification-prefs-modal')}>
            ✕
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 4px' }}>
          <div className="form-section-title" style={{ marginTop: '16px' }}>
            Delivery Methods
          </div>
          <div className="benefits-grid" style={{ gridTemplateColumns: '1fr' }}>
            <label className="benefit-chip">
              <input
                type="checkbox"
                id="pref-notif-inapp"
                checked={inApp}
                onChange={(e) => setInApp(e.target.checked)}
              />{' '}
              In-App Notifications
            </label>
            <label className="benefit-chip">
              <input
                type="checkbox"
                id="pref-notif-sms"
                checked={sms}
                onChange={(e) => setSms(e.target.checked)}
              />{' '}
              SMS / Phone Notifications
            </label>
            <label className="benefit-chip">
              <input
                type="checkbox"
                id="pref-notif-push"
                checked={push}
                onChange={(e) => setPush(e.target.checked)}
              />{' '}
              Push Notifications
            </label>
          </div>

          <div className="form-section-title" style={{ marginTop: '24px' }}>
            Job Categories
          </div>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginBottom: '12px',
              lineHeight: 1.4,
            }}
          >
            Select the work categories you want to receive job alerts for.
          </p>
          <div className="benefits-grid" style={{ gridTemplateColumns: '1fr' }} id="notif-category-prefs-list">
            <label
              className="benefit-chip"
              style={{
                border: '1px solid var(--mint-primary)',
                background: 'rgba(0, 245, 155, 0.05)',
              }}
            >
              <input
                type="checkbox"
                id="pref-notif-all"
                checked={allCategoriesSelected}
                onChange={handleToggleAll}
              />
              All Notifications
            </label>
            {nonAllCategories.map((c) => (
              <label key={c.key} className="benefit-chip">
                <input
                  type="checkbox"
                  checked={selectedCategories.has(c.key)}
                  onChange={() => handleToggleCategory(c.key)}
                />{' '}
                {c.label}
              </label>
            ))}
          </div>
        </div>
        <div
          className="form-actions-bottom"
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            className="btn-submit"
            style={{ width: '100%' }}
            onClick={handleSave}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
