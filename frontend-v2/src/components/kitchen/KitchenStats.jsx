import React from 'react';

export default function KitchenStats({ totalCount = 0, placedCount = 0, preparingCount = 0, oldestWaitMinutes = 0 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 'var(--gds-space-3, 12px)',
        marginBottom: 'var(--gds-space-4, 16px)',
      }}
    >
      {/* Total Active */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--gds-radius-xl, 12px)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Tickets
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}>
            {totalCount}
          </div>
        </div>
        <div style={{ fontSize: '1.5rem', opacity: 0.8 }}>📋</div>
      </div>

      {/* New / Incoming (PLACED) */}
      <div
        style={{
          background: placedCount > 0 ? 'rgba(217, 119, 6, 0.08)' : 'var(--color-surface)',
          border: placedCount > 0 ? '1px solid rgba(217, 119, 6, 0.35)' : '1px solid var(--color-border)',
          borderRadius: 'var(--gds-radius-xl, 12px)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <span style={{ fontSize: '0.72rem', color: placedCount > 0 ? '#d97706' : 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Incoming Orders
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: placedCount > 0 ? '#d97706' : 'var(--color-text)', lineHeight: 1.1 }}>
            {placedCount}
          </div>
        </div>
        <div style={{ fontSize: '1.5rem', opacity: placedCount > 0 ? 1 : 0.6 }}>🔔</div>
      </div>

      {/* In Preparation (PREPARING) */}
      <div
        style={{
          background: preparingCount > 0 ? 'rgba(2, 132, 199, 0.08)' : 'var(--color-surface)',
          border: preparingCount > 0 ? '1px solid rgba(2, 132, 199, 0.35)' : '1px solid var(--color-border)',
          borderRadius: 'var(--gds-radius-xl, 12px)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <span style={{ fontSize: '0.72rem', color: preparingCount > 0 ? '#0284c7' : 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            In Preparation
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: preparingCount > 0 ? '#0284c7' : 'var(--color-text)', lineHeight: 1.1 }}>
            {preparingCount}
          </div>
        </div>
        <div style={{ fontSize: '1.5rem', opacity: preparingCount > 0 ? 1 : 0.6 }}>🍳</div>
      </div>

      {/* Queue Urgency / Oldest wait */}
      <div
        style={{
          background: oldestWaitMinutes >= 15 ? 'rgba(239, 68, 68, 0.08)' : 'var(--color-surface)',
          border: oldestWaitMinutes >= 15 ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid var(--color-border)',
          borderRadius: 'var(--gds-radius-xl, 12px)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <span style={{ fontSize: '0.72rem', color: oldestWaitMinutes >= 15 ? '#ef4444' : 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Oldest Ticket Wait
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: oldestWaitMinutes >= 15 ? '#ef4444' : 'var(--color-text)', lineHeight: 1.1 }}>
            {totalCount > 0 ? `${oldestWaitMinutes}m` : '0m'}
          </div>
        </div>
        <div style={{ fontSize: '1.5rem', opacity: 0.8 }}>⏱️</div>
      </div>
    </div>
  );
}

