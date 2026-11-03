import React from 'react';

const STATUS_CONFIGS = {
  AVAILABLE: {
    label: 'AVAILABLE',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
    dot: '#10b981',
    icon: '🟢',
  },
  OCCUPIED: {
    label: 'OCCUPIED',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.3)',
    dot: '#3b82f6',
    icon: '🔵',
  },
  BILL_REQUESTED: {
    label: 'BILL REQUESTED',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.4)',
    dot: '#f59e0b',
    icon: '💳',
  },
  CLEANING_NEEDED: {
    label: 'CLEANING NEEDED',
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.12)',
    border: 'rgba(236, 72, 153, 0.3)',
    dot: '#ec4899',
    icon: '🧹',
  },
};

export default function TableStatusBadge({ status = 'AVAILABLE', size = 'md' }) {
  const config = STATUS_CONFIGS[status] || {
    label: status,
    color: 'var(--color-text-muted)',
    bg: 'var(--color-surface-sunken)',
    border: 'var(--color-border)',
    dot: '#888',
    icon: '⚪',
  };

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '4px' : '6px',
        padding: isSmall ? '2px 8px' : '4px 10px',
        borderRadius: 'var(--gds-radius-full, 9999px)',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        fontSize: isSmall ? '0.675rem' : '0.75rem',
        fontWeight: '700',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        fontFamily: 'var(--gds-font-mono, monospace)',
        whiteSpace: 'nowrap',
        boxShadow: status === 'BILL_REQUESTED' ? '0 0 10px rgba(245, 158, 11, 0.25)' : 'none',
      }}
    >
      <span
        style={{
          width: isSmall ? '6px' : '8px',
          height: isSmall ? '6px' : '8px',
          borderRadius: '50%',
          backgroundColor: config.dot,
          boxShadow: `0 0 6px ${config.dot}`,
          animation: status === 'BILL_REQUESTED' ? 'pulse 1.2s infinite' : 'none',
        }}
      />
      <span>{config.label}</span>
    </span>
  );
}

