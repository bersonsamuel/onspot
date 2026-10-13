'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function LoginModal() {
  const { activeModal, closeModal, login, signup } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'seeker' | 'dealer'>('seeker');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Demo credentials come from env only — never hardcoded
  const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL;
  const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD;
  const showDemo = Boolean(
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && demoEmail && demoPassword
  );

  if (activeModal !== 'login-modal') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signup(email, password, name, role);
      } else {
        await login(email, password);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    if (!demoEmail || !demoPassword) return;
    setIsSubmitting(true);
    try {
      await login(demoEmail, demoPassword);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`modal-overlay ${activeModal === 'login-modal' ? 'open' : ''}`}
      id="login-modal"
      role="dialog"
      aria-modal="true"
      aria-label={isSignUp ? 'Create an OnSpot Account' : 'Sign in to OnSpot'}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal('login-modal');
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h3>{isSignUp ? 'Create an OnSpot Account' : 'Sign In to OnSpot'}</h3>
          <button
            className="close-btn"
            aria-label="Close sign-in modal"
            onClick={() => closeModal('login-modal')}
          >
            ✕
          </button>
        </div>

        {/* Sign In / Sign Up tab switch */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            type="button"
            id="tab-signin"
            className="filter-chip"
            style={{
              flex: 1,
              justifyContent: 'center',
              background: !isSignUp ? 'var(--mint-primary)' : 'rgba(255,255,255,0.06)',
              color: !isSignUp ? '#05100a' : 'var(--text-secondary)',
              fontWeight: 700,
            }}
            onClick={() => setIsSignUp(false)}
            aria-pressed={!isSignUp}
          >
            Sign In
          </button>
          <button
            type="button"
            id="tab-signup"
            className="filter-chip"
            style={{
              flex: 1,
              justifyContent: 'center',
              background: isSignUp ? 'var(--mint-primary)' : 'rgba(255,255,255,0.06)',
              color: isSignUp ? '#05100a' : 'var(--text-secondary)',
              fontWeight: 700,
            }}
            onClick={() => setIsSignUp(true)}
            aria-pressed={isSignUp}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="signup-name">Full Name</label>
              <input
                type="text"
                className="form-control"
                id="signup-name"
                name="name"
                autoComplete="name"
                required={isSignUp}
                value={name}
                placeholder="Your full name"
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              type="email"
              className="form-control"
              id="login-email"
              name="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              type="password"
              className="form-control"
              id="login-password"
              name={isSignUp ? 'new-password' : 'current-password'}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
              value={password}
              placeholder={isSignUp ? 'Min 6 characters' : 'Your password'}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="signup-role">I want to…</label>
              <select
                id="signup-role"
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value as 'seeker' | 'dealer')}
                disabled={isSubmitting}
              >
                <option value="seeker">Find part-time work (Seeker)</option>
                <option value="dealer">Post job openings (Dealer)</option>
              </select>
            </div>
          )}

          {!isSignUp && (
            <div style={{ textAlign: 'right', marginBottom: '16px' }}>
              <a
                href="#"
                style={{ fontSize: '12px', color: 'var(--mint-primary)', textDecoration: 'none' }}
                onClick={(e) => e.preventDefault()}
              >
                Forgot Password?
              </a>
            </div>
          )}

          <button
            type="submit"
            id="login-submit-btn"
            className="btn-action-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '11px', marginBottom: '10px' }}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? (isSignUp ? 'Creating account…' : 'Signing in…')
              : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>

          {showDemo && !isSignUp && (
            <button
              type="button"
              id="demo-login-btn"
              className="btn-details"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '9px',
                fontSize: '12px',
                border: '1px dashed var(--border-mint)',
                color: 'var(--mint-primary)',
              }}
              onClick={handleDemoLogin}
              disabled={isSubmitting}
            >
              ⚡ Quick Login with Demo Account
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
