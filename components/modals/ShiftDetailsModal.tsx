/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { getCategoryMedia } from '@/lib/initialData';

export default function ShiftDetailsModal() {
  const {
    activeModal,
    activeModalShift: item,
    closeAllModals,
    appliedJobIds,
    applyForJob,
    userRole,
    openModal,
  } = useApp();

  if (activeModal !== 'shift-modal' && activeModal !== 'details-modal') return null;
  if (!item) return null;

  const isApplied = appliedJobIds.has(item.id);
  const media = getCategoryMedia(item.category);
  const itemImg = item.image || media.src;
  const itemFallback = media.fallback;

  return (
    <div role="dialog" aria-modal="true" className="modal-overlay open" id="details-modal">
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
              <rect width="20" height="14" x="2" y="7" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            Shift Details & Application
          </h3>
          <button className="close-btn" aria-label="Close" onClick={closeAllModals}>
            ✕
          </button>
        </div>
        <div id="details-modal-content">
          <div
            style={{
              width: '100%',
              height: '160px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              marginBottom: '16px',
              position: 'relative',
              background: '#09130e',
            }}
          >
            <img
              src={itemImg}
              alt={item.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = itemFallback;
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(14,24,19,0.85) 100%)',
              }}
            ></div>
            <div style={{ position: 'absolute', bottom: '12px', left: '14px' }}>
              <span className="category-tag on-image">
                {item.categoryDisplay || item.category}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '19px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginTop: '4px',
                }}
              >
                {item.fullTitle || item.title}
              </h2>
              <div
                style={{
                  fontSize: '12.5px',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                }}
              >
                Posted by <strong>{item.dealerName}</strong> (★ {item.dealerRating})
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: 'var(--mint-primary)',
                  fontFamily: 'Space Grotesk',
                }}
              >
                {item.pay}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {item.payType || 'Per Shift'}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              marginBottom: '16px',
            }}
          >
            <div className="info-item">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  Venue Location
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {item.loc}
                </div>
              </div>
            </div>
            <div className="info-item">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  Timing & Date
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {item.date} • {item.time}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                marginBottom: '5px',
              }}
            >
              Role Description
            </h4>
            <p
              style={{
                fontSize: '13.5px',
                color: 'var(--text-primary)',
                lineHeight: 1.55,
              }}
            >
              {item.description ||
                'Assisting venue leads with guests hospitality, counter coordination, and cordial service.'}
            </p>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                marginBottom: '5px',
              }}
            >
              Requirements & Dress Code
            </h4>
            <div
              style={{
                padding: '10px 12px',
                background: 'rgba(0, 245, 155, 0.05)',
                borderLeft: '3px solid var(--mint-primary)',
                borderRadius: '4px',
                fontSize: '12.5px',
                color: 'var(--text-primary)',
              }}
            >
              👔 <strong>Dress Code:</strong> {item.dressCode || 'Smart formals'}
              <br />
              📋 <strong>Criteria:</strong>{' '}
              {item.requirements || 'Punctuality and neat grooming.'}
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              Perks & Facilities
            </h4>
            <div className="perks-row">
              {(item.perks || []).map((p, idx) => (
                <span
                  key={idx}
                  className="perk-pill"
                  style={{ padding: '4px 10px' }}
                >
                  ✨ {p}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                marginBottom: '5px',
              }}
            >
              Dealer Details
            </h4>
            <div
              style={{
                padding: '12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {item.dealerName}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="var(--mint-primary)"
                      stroke="#000"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    ⭐ {item.dealerRating} Rating
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <a
                  className="btn-details"
                  style={{
                    flex: 1,
                    padding: '8px',
                    textAlign: 'center',
                    textDecoration: 'none',
                  }}
                  href={`tel:${item.phone || '+910000000000'}`}
                >
                  📞 Call
                </a>
                <button
                  className="btn-details"
                  style={{ flex: 1, padding: '8px' }}
                  onClick={() => openModal('chat-modal')}
                >
                  💬 Message
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '14px',
            }}
          >
            <button
              className="btn-details"
              onClick={closeAllModals}
              style={{ flex: 1, padding: '10px' }}
            >
              Close
            </button>
            {userRole === 'seeker' ? (
              <button
                className={`btn-action-primary ${isApplied ? 'applied' : ''}`}
                style={{ flex: 2, justifyContent: 'center', padding: '11px' }}
                onClick={() => {
                  if (!isApplied) applyForJob(item);
                }}
                disabled={isApplied}
              >
                {isApplied ? '✓ Application Submitted' : 'Confirm & Apply'}
              </button>
            ) : (
              <button
                className="btn-action-primary"
                style={{ flex: 2, justifyContent: 'center' }}
                onClick={() => {
                  closeAllModals();
                  openModal('manage-applicants-modal', item);
                }}
              >
                View Current Applicants
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
