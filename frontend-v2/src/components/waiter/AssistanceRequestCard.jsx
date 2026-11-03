import React from 'react';
import Button from '../ui/Button';

const TYPE_CONFIG = {
  WATER: {
    label: 'Water Refill',
    icon: '💧',
    color: '#0284c7',
    bg: 'rgba(2, 132, 199, 0.1)',
    border: 'rgba(2, 132, 199, 0.3)',
  },
  BILL_REQUEST: {
    label: 'Bill / Payment Request',
    icon: '💳',
    color: '#d97706',
    bg: 'rgba(217, 119, 6, 0.12)',
    border: 'rgba(217, 119, 6, 0.4)',
  },
  WAITER_HELP: {
    label: 'Waiter Assistance',
    icon: '🙋',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(139, 92, 246, 0.3)',
  },
  CLEAN_TABLE: {
    label: 'Clean Table',
    icon: '🧹',
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.1)',
    border: 'rgba(236, 72, 153, 0.3)',
  },
};

export default function AssistanceRequestCard({
  request,
  onResolve,
  isProcessing = false,
}) {
  const { id, tableNumber, requestType, additionalNotes, createdAt } = request;

  const config = TYPE_CONFIG[requestType] || {
    label: requestType,
    icon: '🔔',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.3)',
  };

  const isBill = requestType === 'BILL_REQUEST';

  const timeFormatted = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: `2px solid ${config.color}`,
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: isBill ? '0 0 16px rgba(217, 119, 6, 0.2)' : 'var(--shadow-sm)',
        position: 'relative',
      }}
    >
      {/* Header: Table & Request Type */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-md, 8px)',
              background: config.color,
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 800,
            }}
          >
            Table {tableNumber}
          </span>
          <span style={{ fontSize: '1.25rem' }}>{config.icon}</span>
        </div>

        {timeFormatted && (
          <span
            style={{
              fontSize: '0.725rem',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--gds-font-mono, monospace)',
            }}
          >
            {timeFormatted}
          </span>
        )}
      </div>

      {/* Request Type Label */}
      <div>
        <span
          style={{
            display: 'inline-block',
            padding: '3px 8px',
            borderRadius: 'var(--gds-radius-full, 9999px)',
            background: config.bg,
            border: `1px solid ${config.border}`,
            color: config.color,
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          {config.label}
        </span>
      </div>

      {/* Guest notes */}
      {additionalNotes ? (
        <div
          style={{
            padding: '8px 10px',
            borderRadius: 'var(--radius-sm, 6px)',
            background: 'var(--color-surface-sunken)',
            fontSize: '0.8rem',
            color: 'var(--color-text)',
            fontStyle: 'italic',
          }}
        >
          "{additionalNotes}"
        </div>
      ) : (
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          Guest called for {config.label.toLowerCase()}
        </div>
      )}

      {isBill && (
        <div
          style={{
            fontSize: '0.7rem',
            color: '#b45309',
            background: 'rgba(245, 158, 11, 0.1)',
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm, 6px)',
          }}
        >
          💡 Resolving a bill request closes the table session and marks it AVAILABLE.
        </div>
      )}

      {/* Action: Resolve Button */}
      <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
        <Button
          variant="primary"
          size="sm"
          style={{
            width: '100%',
            background: config.color,
            borderColor: config.color,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
          disabled={isProcessing}
          onClick={() => onResolve && onResolve(id, requestType)}
        >
          <span>✓</span>
          <span>{isProcessing ? 'Resolving...' : 'Mark Resolved'}</span>
        </Button>
      </div>
    </div>
  );
}

