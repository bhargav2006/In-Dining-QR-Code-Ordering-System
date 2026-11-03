import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function WaiterLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('waiter');
  const [password, setPassword] = useState('waiter123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setUsername('waiter');
      setPassword('waiter123');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onLoginSuccess(username, password);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
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
    <Modal isOpen={isOpen} onClose={onClose} title="Floor Staff Authentication">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: 0 }}>
          Sign in with your Waiter or Administrator account to manage tables, receive ready food tickets, and respond to guest calls.
        </p>

        {/* Quick Fill Testing Presets */}
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
            QUICK PRESETS (TAP TO FILL):
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('waiter', 'waiter123')}
              style={{
                background: 'var(--color-surface-sunken)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>👔</span>
              <span>Lead Waiter (waiter / waiter123)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin123')}
              style={{
                background: 'var(--color-surface-sunken)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>👑</span>
              <span>Admin (admin / admin123)</span>
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md, 8px)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="waiter-username" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
            Username
          </label>
          <input
            id="waiter-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.95rem',
            }}
            placeholder="e.g. waiter"
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="waiter-password" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
            Password
          </label>
          <input
            id="waiter-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.95rem',
            }}
            placeholder="••••••••"
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Station'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

