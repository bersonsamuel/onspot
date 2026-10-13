'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

interface SupportTicket {
  ticketId: string;
  type: string;
  jobTitle: string;
  amount: string;
  status: string;
  createdAt: string;
}

export default function SupportModal() {
  const { activeModal, closeModal, appliedJobs, showToast } = useApp();

  const [step, setStep] = useState<'main' | 'category' | 'refund-info' | 'refund-form' | 'success'>('main');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Form states
  const [refundJobId, setRefundJobId] = useState('');
  const [refundPaymentId, setRefundPaymentId] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundDesc, setRefundDesc] = useState('');

  if (activeModal !== 'support-modal') {
    return null;
  }

  const titleMap: Record<string, string> = {
    payment: 'Payment & Refund',
    job: 'Job / Application',
    shift: 'Shift Issues',
    account: 'Account & Profile',
    payment_not_received: 'Payment Not Received',
    location: 'Location / Attendance',
    report: 'Report a Problem',
    contact: 'Contact Support',
  };

  const handleCategorySelect = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    setStep('category');
  };

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const app = appliedJobs.find((j) => j.jobId === refundJobId);
    const newTicket: SupportTicket = {
      ticketId: 'OSP-REF-' + Math.floor(10000 + Math.random() * 90000),
      type: 'Refund Request',
      jobTitle: app?.job?.title || 'General',
      amount: '₹' + refundAmount,
      status: 'Pending Review',
      createdAt: new Date().toISOString(),
    };
    setTickets((prev) => [newTicket, ...prev]);
    setSubmittedTicket(newTicket);
    setStep('success');
    showToast('Refund request submitted successfully.');
  };

  const handleClose = () => {
    closeModal('support-modal');
    // Reset view
    setTimeout(() => {
      setStep('main');
      setSubmittedTicket(null);
    }, 200);
  };

  return (
    <div
      className={`modal-overlay ${activeModal === 'support-modal' ? 'open' : ''}`}
      id="support-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="modal-card" id="support-center-content">
        <div className="modal-header">
          <h3>Support Center</h3>
          <button className="close-btn" aria-label="Close" onClick={handleClose}>
            ✕
          </button>
        </div>

        {step === 'main' && (
          <div id="support-step-1">
            <h4
              style={{
                textAlign: 'center',
                fontSize: '16px',
                marginBottom: '16px',
                color: 'var(--text-primary)',
              }}
            >
              How can we help you?
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                className="btn-secondary-sidebar"
                style={{ height: 'auto', padding: '12px', flexDirection: 'column', gap: '8px' }}
                onClick={() => handleCategorySelect('payment')}
              >
                <span style={{ fontSize: '24px' }}>💳</span>
                <span>Payment &amp; Refund</span>
              </button>
              <button
                className="btn-secondary-sidebar"
                style={{ height: 'auto', padding: '12px', flexDirection: 'column', gap: '8px' }}
                onClick={() => handleCategorySelect('job')}
              >
                <span style={{ fontSize: '24px' }}>📋</span>
                <span>Job / Application</span>
              </button>
              <button
                className="btn-secondary-sidebar"
                style={{ height: 'auto', padding: '12px', flexDirection: 'column', gap: '8px' }}
                onClick={() => handleCategorySelect('shift')}
              >
                <span style={{ fontSize: '24px' }}>🕐</span>
                <span>Shift Issues</span>
              </button>
              <button
                className="btn-secondary-sidebar"
                style={{ height: 'auto', padding: '12px', flexDirection: 'column', gap: '8px' }}
                onClick={() => handleCategorySelect('account')}
              >
                <span style={{ fontSize: '24px' }}>👤</span>
                <span>Account &amp; Profile</span>
              </button>
              <button
                className="btn-secondary-sidebar"
                style={{ height: 'auto', padding: '12px', flexDirection: 'column', gap: '8px' }}
                onClick={() => handleCategorySelect('payment_not_received')}
              >
                <span style={{ fontSize: '24px' }}>💰</span>
                <span>Payment Not Received</span>
              </button>
              <button
                className="btn-secondary-sidebar"
                style={{ height: 'auto', padding: '12px', flexDirection: 'column', gap: '8px' }}
                onClick={() => handleCategorySelect('location')}
              >
                <span style={{ fontSize: '24px' }}>📍</span>
                <span>Location / Attendance</span>
              </button>
              <button
                className="btn-secondary-sidebar"
                style={{ height: 'auto', padding: '12px', flexDirection: 'column', gap: '8px' }}
                onClick={() => handleCategorySelect('report')}
              >
                <span style={{ fontSize: '24px' }}>🚨</span>
                <span>Report a Problem</span>
              </button>
              <button
                className="btn-secondary-sidebar"
                style={{ height: 'auto', padding: '12px', flexDirection: 'column', gap: '8px' }}
                onClick={() => handleCategorySelect('contact')}
              >
                <span style={{ fontSize: '24px' }}>💬</span>
                <span>Contact Support</span>
              </button>
            </div>

            {tickets.length > 0 && (
              <div id="support-step-ticket-history" style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-primary)' }}>
                  My Support Requests
                </h4>
                <div id="support-ticket-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tickets.map((t) => (
                    <div
                      key={t.ticketId}
                      style={{
                        padding: '10px',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--mint-primary)' }}>#{t.ticketId}</span>
                        <span style={{ color: 'var(--accent-gold)' }}>{t.status}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        {t.type} • {t.jobTitle} • {t.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'category' && (
          <div id="support-step-category">
            <button
              className="btn-cancel"
              style={{ padding: 0, marginBottom: '12px' }}
              onClick={() => setStep('main')}
            >
              ← Back
            </button>
            <h4
              id="support-category-title"
              style={{
                fontSize: '16px',
                marginBottom: '16px',
                color: 'var(--text-primary)',
              }}
            >
              {titleMap[selectedCategory] || 'Category'}
            </h4>
            <div id="support-category-options" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedCategory === 'payment' ? (
                <>
                  <button
                    className="btn-secondary-sidebar"
                    style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                    onClick={() => showToast('Payment verification flow not implemented.')}
                  >
                    Payment failed
                  </button>
                  <button
                    className="btn-secondary-sidebar"
                    style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                    onClick={() => showToast('Will contact support for deduction issue.')}
                  >
                    Amount deducted but application not confirmed
                  </button>
                  <button
                    className="btn-secondary-sidebar"
                    style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                    onClick={() => showToast('Check ticket history below.')}
                  >
                    Refund status
                  </button>
                  <button
                    className="btn-secondary-sidebar"
                    style={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      borderColor: 'var(--mint-primary)',
                      color: 'var(--mint-primary)',
                    }}
                    onClick={() => setStep('refund-info')}
                  >
                    Request a refund
                  </button>
                  <button
                    className="btn-secondary-sidebar"
                    style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                    onClick={() => showToast('Connecting to billing.')}
                  >
                    Wrong payment amount
                  </button>
                  <button
                    className="btn-secondary-sidebar"
                    style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                    onClick={() => showToast('Checking payment verification...')}
                  >
                    Payment verification
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                    Support options for {titleMap[selectedCategory]} will appear here.
                  </div>
                  <button
                    className="btn-action-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => showToast('Creating general ticket...')}
                  >
                    Submit General Ticket
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {step === 'refund-info' && (
          <div id="support-step-refund-info">
            <button
              className="btn-cancel"
              style={{ padding: 0, marginBottom: '12px' }}
              onClick={() => setStep('category')}
            >
              ← Back
            </button>
            <h4
              style={{
                fontSize: '16px',
                marginBottom: '16px',
                color: 'var(--text-primary)',
              }}
            >
              Refund Process
            </h4>
            <ol
              style={{
                marginLeft: '20px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '16px',
                lineHeight: 1.6,
              }}
            >
              <li>Submit refund request</li>
              <li>OnSpot verifies the payment/application</li>
              <li>Refund request is processed</li>
              <li>Refund is sent through the original payment method</li>
              <li>User receives confirmation</li>
            </ol>
            <div
              style={{
                background: 'var(--bg-darkest)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
              }}
            >
              <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                <strong>Expected Processing Time:</strong> 3-5 Business Days
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                <strong>Refund Policy:</strong>{' '}
                <a href="#" style={{ color: 'var(--mint-primary)' }}>
                  View Policy
                </a>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-cancel"
                style={{ flex: 1 }}
                onClick={() => handleCategorySelect('contact')}
              >
                Contact Support
              </button>
              <button
                className="btn-action-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setStep('refund-form')}
              >
                Request Refund
              </button>
            </div>
          </div>
        )}

        {step === 'refund-form' && (
          <div id="support-step-refund-form">
            <button
              className="btn-cancel"
              style={{ padding: 0, marginBottom: '12px' }}
              onClick={() => setStep('refund-info')}
            >
              ← Back
            </button>
            <h4
              style={{
                fontSize: '16px',
                marginBottom: '16px',
                color: 'var(--text-primary)',
              }}
            >
              Request Refund
            </h4>
            <form id="refund-form" onSubmit={handleRefundSubmit}>
              <div className="form-group">
                <label>Select Job</label>
                <select
                  className="form-control"
                  id="refund-job-select"
                  required
                  value={refundJobId}
                  onChange={(e) => setRefundJobId(e.target.value)}
                >
                  <option value="">Select Job</option>
                  {appliedJobs.map((app) => (
                    <option key={app.id} value={app.jobId}>
                      {app.job ? `${app.job.title} at ${app.job.dealerName}` : app.jobId}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Payment ID</label>
                <input
                  type="text"
                  className="form-control"
                  id="refund-payment-id"
                  placeholder="e.g. PAY-12345"
                  required
                  value={refundPaymentId}
                  onChange={(e) => setRefundPaymentId(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Reason for Refund</label>
                <select
                  className="form-control"
                  id="refund-reason"
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                >
                  <option value="">Select Reason</option>
                  <option value="Event Cancelled">Event Cancelled</option>
                  <option value="Overcharged">Overcharged</option>
                  <option value="Application Rejected">Application Rejected</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  className="form-control"
                  id="refund-amount"
                  placeholder="₹"
                  required
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  id="refund-desc"
                  rows={3}
                  placeholder="Provide more details..."
                  required
                  value={refundDesc}
                  onChange={(e) => setRefundDesc(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn-action-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
              >
                Submit Refund Request
              </button>
            </form>
          </div>
        )}

        {step === 'success' && submittedTicket && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}
            >
              Refund request submitted successfully.
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: '24px',
              }}
            >
              Our support team will review your request.
            </p>

            <div
              style={{
                background: 'var(--bg-card)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'inline-block',
                marginBottom: '24px',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Refund Ticket
              </span>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: 'var(--mint-primary)',
                  marginBottom: '8px',
                }}
              >
                #{submittedTicket.ticketId}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Status
              </span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                {submittedTicket.status}
              </div>
            </div>

            <button
              className="btn-details"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
