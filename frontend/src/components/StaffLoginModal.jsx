import React, { useState } from 'react';
import { X, Lock, User, ShieldCheck } from 'lucide-react';
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
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '420px',
        width: '100%',
        padding: '2rem',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer'
        }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '0.8rem',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            borderRadius: '12px',
            marginBottom: '0.8rem'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>Staff Authentication</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Access restricted portal features
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            color: '#f87171',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            border: '1px solid rgba(244, 63, 94, 0.3)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Demo Fill Quick Buttons */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem', textAlign: 'center' }}>
            Quick Demo Login Accounts:
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button onClick={() => handleQuickFill('admin', 'admin123')} className="btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>
              Manager
            </button>
            <button onClick={() => handleQuickFill('chef', 'kitchen123')} className="btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>
              Kitchen
            </button>
            <button onClick={() => handleQuickFill('waiter', 'waiter123')} className="btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>
              Waiter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
