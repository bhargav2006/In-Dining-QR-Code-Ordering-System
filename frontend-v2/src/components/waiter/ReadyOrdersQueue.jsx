import React from 'react';
import ReadyOrderCard from './ReadyOrderCard';

export default function ReadyOrdersQueue({
  orders = [],
  onMarkServed,
  processingActionIds = new Set(),
}) {
  if (orders.length === 0) {
    return (
      <div
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          background: 'var(--color-surface)',
          border: '1px dashed var(--color-border)',
          borderRadius: 'var(--radius-lg, 12px)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>✨</div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--color-text)' }}>
          No Orders Waiting for Service
        </h3>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          All prepared orders have been served to guest tables. When the kitchen marks tickets ready, they will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
          Kitchen Pass ({orders.length} Ready)
        </h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          Serve immediately while hot
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {orders.map((order) => (
          <ReadyOrderCard
            key={order.orderId}
            order={order}
            onMarkServed={onMarkServed}
            isProcessing={processingActionIds.has(`order-serve-${order.orderId}`)}
          />
        ))}
      </div>
    </div>
  );
}

