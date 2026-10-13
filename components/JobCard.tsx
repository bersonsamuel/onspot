/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Job } from '@/types';
import { useApp } from '@/context/AppContext';
import { getCategoryMedia } from '@/lib/initialData';

interface JobCardProps {
  item: Job;
}

export default function JobCard({ item }: JobCardProps) {
  const {
    userRole,
    appliedJobIds,
    bookmarkedJobIds,
    toggleBookmark,
    openModal,
  } = useApp();

  const isApplied = appliedJobIds.has(item.id);
  const isBookmarked = bookmarkedJobIds.has(item.id);
  const slotsRemaining = item.slotsTotal - item.slotsFilled;
  const progressPercent = Math.round((item.slotsFilled / item.slotsTotal) * 100);
  const media = getCategoryMedia(item.category);
  const itemImg = item.image || media.src;
  const itemFallback = media.fallback;

  return (
    <div className="shift-card" id={`card-${item.id}`}>
      {/* Top Category Image Header with Overlaid Badges */}
      <div className="card-image-wrap">
        <img
          src={itemImg}
          alt={media.alt || item.title}
          className="card-img"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = itemFallback;
          }}
        />
        <div className="card-image-overlay"></div>

        <div className="card-image-top-bar">
          <span className="category-tag on-image">
            <span className="category-tag-dot"></span>
            {item.categoryDisplay || item.category}
          </span>
          <div className="card-actions-top on-image">
            {item.genderReq === 'boys' && (
              <span className="gender-badge on-image boys-only">♂ Boys Only</span>
            )}
            {item.genderReq === 'girls' && (
              <span className="gender-badge on-image girls-only">♀ Girls Only</span>
            )}
            {item.urgent && <span className="urgent-badge on-image">🔥 Urgent</span>}
            <button
              className={`btn-bookmark on-image ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(item.id);
              }}
              title="Save for later"
              aria-label="Bookmark shift"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={isBookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Card Body Details */}
      <div className="card-body">
        <div
          className="card-title"
          onClick={() => openModal('shift-modal', item)}
          title={item.fullTitle || item.title}
        >
          {item.title}
        </div>

        <div className="perks-row">
          {(item.perks || []).slice(0, 2).map((p, idx) => (
            <span key={idx} className="perk-pill">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {p}
            </span>
          ))}
        </div>

        <div className="card-info-list">
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
            <span title={item.loc}>
              <strong>{item.loc}</strong>
            </span>
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
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span>{item.date}</span>
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
            <span>{item.time}</span>
          </div>
        </div>

        <div className="slots-bar-wrapper">
          <div className="slots-bar-header">
            <span>Slots Availability</span>
            <span style={{ color: 'var(--mint-primary)' }}>
              {slotsRemaining} spots left ({item.slotsFilled}/{item.slotsTotal})
            </span>
          </div>
          <div className="slots-progress-track">
            <div
              className="slots-progress-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="card-footer">
          <div className="pay-container">
            <div className="pay-amount">{item.pay}</div>
            <div className="pay-type">{item.payType || 'Guaranteed Pay'}</div>
          </div>

          <div className="card-btn-group">
            <button
              className="btn-details"
              onClick={() => openModal('shift-modal', item)}
            >
              Details
            </button>
            {userRole === 'seeker' ? (
              <button
                className={`btn-action-primary ${isApplied ? 'applied' : ''}`}
                onClick={() => openModal('shift-modal', item)}
                id={`apply-btn-${item.id}`}
              >
                {isApplied ? '✓ Already Applied' : 'Quick Apply'}
              </button>
            ) : (
              <button
                className="btn-action-primary"
                onClick={() => openModal('manage-applicants-modal', item)}
              >
                Manage ({item.applicants ? item.applicants.length : 0})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
