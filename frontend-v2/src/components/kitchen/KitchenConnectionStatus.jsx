import React from 'react';

export default function KitchenConnectionStatus({ status = 'connected', lastPolledAt }) {
  const isConnected = status === 'connected';
  const isReconnecting = status === 'reconnecting';

  const dotColor = isConnected
    ? 'var(--color-primary, #10b981)'
    : isReconnecting
    ? 'var(--color-warning, #f59e0b)'
    : 'var(--color-error, #ef4444)';

  const label = isConnected
    ? 'LIVE SYNC'
    : isReconnecting
    ? 'RECONNECTING...'
    : 'OFFLINE';

  const timeStr = lastPolledAt
    ? new Date(lastPolledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: 'var(--gds-radius-full, 9999px)',
        background: 'var(--color-surface-sunken)',
        border: '1px solid var(--color-border)',
        fontSize: '0.725rem',
        fontWeight: '600',
        fontFamily: 'var(--gds-font-mono, monospace)',
        color: 'var(--color-text)',
      }}
      title={lastPolledAt ? `Last synchronized at ${timeStr}` : 'Connecting...'}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          boxShadow: isConnected ? `0 0 8px ${dotColor}` : 'none',
          animation: isReconnecting ? 'pulse 1.5s infinite' : 'none',
        }}
      />
      <span>{label}</span>
      {timeStr && (
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.68rem', marginLeft: '2px' }}>
          {timeStr}
        </span>
      )}
    </div>
  );
}

