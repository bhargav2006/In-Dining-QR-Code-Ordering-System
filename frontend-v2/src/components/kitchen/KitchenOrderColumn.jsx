import React from 'react';
import KitchenOrderCard from './KitchenOrderCard';

export default function KitchenOrderColumn({
  title,
  count = 0,
  orders = [],
  status,
  onStartPreparing,
  onMarkReady,
  processingOrderIds,
  emptyMessage = 'No orders in this queue',
  emptyIcon = '✨',
  accentColor = 'var(--color-primary)',
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-surface-sunken)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--gds-radius-2xl, 16px)',
        padding: '16px',
        minHeight: '400px',
        flex: '1 1 0',
        minWidth: 0,
      }}
    >
      {/* Column Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--color-divider)',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: accentColor,
            }}
          />
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h2>
        </div>

        {/* Counter Pill */}
        <span
          style={{
            padding: '2px 10px',
            borderRadius: 'var(--gds-radius-full, 9999px)',
            background: count > 0 ? accentColor : 'var(--color-surface)',
            color: count > 0 ? '#ffffff' : 'var(--color-text-muted)',
            fontWeight: 800,
            fontSize: '0.85rem',
            fontFamily: 'var(--gds-font-mono, monospace)',
            border: count > 0 ? 'none' : '1px solid var(--color-border)',
          }}
        >
          {count}
        </span>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div
          style={{
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 16px',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.6 }}>{emptyIcon}</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{emptyMessage}</div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
          }}
        >
          {orders.map((order) => (
            <KitchenOrderCard
              key={order.orderId}
              order={order}
              onStartPreparing={onStartPreparing}
              onMarkReady={onMarkReady}
              isProcessing={processingOrderIds.has(order.orderId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

