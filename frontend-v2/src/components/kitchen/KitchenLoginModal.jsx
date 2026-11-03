import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function KitchenLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('chef');
  const [password, setPassword] = useState('kitchen123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset to default kitchen account on modal open
  React.useEffect(() => {
    if (isOpen) {
      setUsername('chef');
      setPassword('kitchen123');
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
    <Modal isOpen={isOpen} onClose={onClose} title="Kitchen Staff Authentication">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: 0 }}>
          Sign in with your kitchen staff or administrator account to access the live Kitchen Display System.
        </p>

        {/* Quick Fill Testing Presets */}
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
            QUICK PRESETS (TAP TO FILL):
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('chef', 'kitchen123')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: username === 'chef' ? 'var(--color-primary-container)' : 'var(--color-surface-sunken)',
                color: username === 'chef' ? 'var(--color-on-primary-container)' : 'var(--color-text)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              👨‍🍳 Head Chef (chef)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin123')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: username === 'admin' ? 'var(--color-primary-container)' : 'var(--color-surface-sunken)',
                color: username === 'admin' ? 'var(--color-on-primary-container)' : 'var(--color-text)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🛡️ Admin (admin)
            </button>
          </div>
        </div>

        {/* Username */}
        <div>
          <label
            htmlFor="kds-username"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}
          >
            Staff Username
          </label>
          <input
            id="kds-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--gds-radius-input, 8px)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-sunken)',
              color: 'var(--color-text)',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="kds-password"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}
          >
            Password
          </label>
          <input
            id="kds-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--gds-radius-input, 8px)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-sunken)',
              color: 'var(--color-text)',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Error notification */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            style={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            style={{ flex: 2 }}
          >
            {loading ? 'Authenticating...' : 'Sign In to KDS'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
