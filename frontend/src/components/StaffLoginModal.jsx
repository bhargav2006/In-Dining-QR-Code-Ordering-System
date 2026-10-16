import React, { useState } from 'react';
import { X, Lock, User, ShieldCheck, ArrowRight, ChefHat, ConciergeBell, LayoutDashboard } from 'lucide-react';
import { authApi } from '../services/api';

export default function StaffLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authApi.login(username, password);
      onLoginSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem'
      }}
    >
      <div className="glass-panel-elevated animate-pop-in" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '2.25rem',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '0.9rem',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            borderRadius: '16px',
            marginBottom: '0.9rem',
            boxShadow: 'var(--shadow-glow-emerald)'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h2 id="login-modal-title" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            Staff Authentication
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Sign in with your role-verified credentials
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            color: '#f87171',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            fontSize: '0.86rem',
            marginBottom: '1.25rem',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.45rem', fontWeight: 700 }}>
              Staff Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input-glass"
                style={{ paddingLeft: '2.6rem' }}
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.45rem', fontWeight: 700 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-glass"
                style={{ paddingLeft: '2.6rem' }}
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? 'Authenticating...' : (
              <>
                Sign In to Portal <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Selection Bar */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-glass)' }}>
          <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '0.75rem', textAlign: 'center', fontWeight: 600 }}>
            Quick Demo Accounts:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin123')}
              className="btn-secondary"
              style={{
                padding: '0.5rem 0.2rem',
                fontSize: '0.74rem',
                flexDirection: 'column',
                gap: '0.25rem',
                minHeight: '52px',
                border: username === 'admin' ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                color: username === 'admin' ? 'var(--primary)' : 'var(--text-muted)'
              }}
            >
              <LayoutDashboard size={14} />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('manager1', 'admin123')}
              className="btn-secondary"
              style={{
                padding: '0.5rem 0.2rem',
                fontSize: '0.74rem',
                flexDirection: 'column',
                gap: '0.25rem',
                minHeight: '52px',
                border: username === 'manager1' ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                color: username === 'manager1' ? 'var(--primary)' : 'var(--text-muted)'
              }}
            >
              <Store size={14} />
              <span>Fine Diner</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('chef', 'kitchen123')}
              className="btn-secondary"
              style={{
                padding: '0.5rem 0.2rem',
                fontSize: '0.74rem',
                flexDirection: 'column',
                gap: '0.25rem',
                minHeight: '52px',
                border: username === 'chef' ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                color: username === 'chef' ? 'var(--primary)' : 'var(--text-muted)'
              }}
            >
              <ChefHat size={14} />
              <span>Kitchen</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('waiter', 'waiter123')}
              className="btn-secondary"
              style={{
                padding: '0.5rem 0.2rem',
                fontSize: '0.74rem',
                flexDirection: 'column',
                gap: '0.25rem',
                minHeight: '52px',
                border: username === 'waiter' ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                color: username === 'waiter' ? 'var(--primary)' : 'var(--text-muted)'
              }}
            >
              <ConciergeBell size={14} />
              <span>Waiter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
