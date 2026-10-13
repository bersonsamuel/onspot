/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Applicant } from '@/types';
import { isSupabaseConfigured, getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ManageApplicantsModal() {
  const { activeModal, activeModalShift, closeModal, showToast } = useApp();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadApplicants = useCallback(async () => {
    if (!activeModalShift?.id || !isSupabaseConfigured()) {
      setApplicants([]);
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          applied_at,
          profiles!applications_user_id_fkey (
            id,
            name,
            rating,
            avatar_url
          )
        `)
        .eq('job_id', activeModalShift.id)
        .order('applied_at', { ascending: true });

      if (error) {
        showToast('⚠️ Could not load applicants. Please try again.');
        return;
      }

       
      const mapped: Applicant[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.profiles?.name || 'Unnamed',
        rating: Number(row.profiles?.rating) || 5.0,
        gigs: 0,
        phone: '',            // not exposed to public by RLS
        avatar: row.profiles?.avatar_url || '',
        status: row.status,
      }));
      setApplicants(mapped);
    } finally {
      setLoading(false);
    }
  }, [activeModalShift?.id, showToast]);

  useEffect(() => {
    if (activeModal === 'manage-modal') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadApplicants();
    } else {
       
      setApplicants([]);
    }
  }, [activeModal, loadApplicants]);

  const updateStatus = async (
    appId: string,
    newStatus: 'Accepted' | 'Declined' | 'Completed',
    label: string
  ) => {
    if (!isSupabaseConfigured()) return;
    setUpdatingId(appId);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', appId);

      if (error) {
        showToast(`⚠️ Couldn't ${label.toLowerCase()}. Please try again.`);
        return;
      }

      setApplicants((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      showToast(`✅ ${label} successfully.`);
    } finally {
      setUpdatingId(null);
    }
  };

  if (activeModal !== 'manage-modal') return null;

  return (
    <div
      className={`modal-overlay ${activeModal === 'manage-modal' ? 'open' : ''}`}
      id="manage-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Manage Applicants"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal('manage-modal');
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--mint-primary)" strokeWidth="2.5" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Manage Shift Applicants
          </h3>
          <button className="close-btn" onClick={() => closeModal('manage-modal')} aria-label="Close">
            ✕
          </button>
        </div>

        <h4
          id="manage-post-title"
          style={{ fontSize: '14px', color: 'var(--mint-primary)', marginBottom: '10px' }}
        >
          {activeModalShift?.title || 'Opening Title'}
        </h4>

        <div className="applicants-list" id="manage-applicants-list">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              Loading applicants…
            </div>
          ) : applicants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              No seekers have applied yet. Your opening is live in the search feed.
            </div>
          ) : (
            applicants.map((app) => {
              const isUpdating = updatingId === app.id;
              const currentStatus = app.status || 'Applied';
              const isAccepted = currentStatus === 'Accepted';
              const isDeclined = currentStatus === 'Declined';
              const isCompleted = currentStatus === 'Completed';

              return (
                <div className="applicant-item" id={`app-row-${app.id}`} key={app.id}>
                  <div className="applicant-info">
                    {app.avatar ? (
                      <img
                        src={app.avatar}
                        className="applicant-avatar"
                        alt={app.name}
                        width={40}
                        height={40}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="applicant-avatar"
                        style={{
                          background: 'var(--mint-primary)',
                          color: '#05100a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                        aria-label={app.name}
                      >
                        {app.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="applicant-name">{app.name}</div>
                      <div className="applicant-sub">
                        ★ {Number(app.rating).toFixed(1)} &bull; {currentStatus}
                      </div>
                    </div>
                  </div>

                  <div className="applicant-actions">
                    {isCompleted ? (
                      <span style={{ fontSize: '12px', color: 'var(--mint-primary)', fontWeight: 600 }}>
                        ✓ Completed
                      </span>
                    ) : isDeclined ? (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Declined
                      </span>
                    ) : isAccepted ? (
                      <button
                        className="btn-cancel"
                        style={{ padding: '4px 10px', fontSize: '11px', border: '1px solid var(--mint-primary)', color: 'var(--mint-primary)' }}
                        disabled={isUpdating}
                        onClick={() => updateStatus(app.id, 'Completed', 'Shift marked complete')}
                      >
                        {isUpdating ? '…' : 'Mark Complete'}
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn-accept"
                          disabled={isUpdating}
                          onClick={() => updateStatus(app.id, 'Accepted', 'Applicant accepted')}
                        >
                          {isUpdating ? '…' : 'Accept & Hire'}
                        </button>
                        <button
                          className="btn-decline"
                          disabled={isUpdating}
                          onClick={() => updateStatus(app.id, 'Declined', 'Applicant declined')}
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
