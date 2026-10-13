'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function DealerFloatingButton() {
  const { openModal, userRole } = useApp();

  // Only visible for dealers
  if (userRole !== 'dealer') return null;

  return (
    <button
      className="dealer-fab"
      id="dealer-fab"
      onClick={() => openModal('post-modal')}
      aria-label="Post a new work requirement"
      title="Post Work Requirement"
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
}
