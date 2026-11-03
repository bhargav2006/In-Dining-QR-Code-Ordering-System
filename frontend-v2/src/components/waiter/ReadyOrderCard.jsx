import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';

export default function ReadyOrderCard({
  order,
  onMarkServed,
  isProcessing = false,
}) {
  const {
    orderId,
    orderNumber,
    tableNumber,
    items = [],
    notes,
    createdAt,
    totalAmount,
  } = order;

  // Elapsed minutes since creation
  const [elapsedMinutes, setElapsedMinutes] = useState(() => {
    if (!createdAt) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
  });

  useEffect(() => {
    if (!createdAt) return;
    const interval = setInterval(() => {
      setElapsedMinutes(Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)));
    }, 30000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const totalItemsCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '2px solid var(--color-primary, #10b981)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
      }}
    >
      {/* Header: Table & Order Number */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-md, 8px)',
              background: 'var(--color-primary, #10b981)',
              color: '#ffffff',
              fontSize: '1.1rem',
              fontWeight: 800,
              letterSpacing: '-0.01em',
            }}
          >
            Table {tableNumber}
          </span>
          <span
            style={{
              fontFamily: 'var(--gds-font-mono, monospace)',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--color-text)',
            }}
          >
            {orderNumber || `#${orderId}`}
          </span>
        </div>

        <span
          style={{
            padding: '3px 8px',
            borderRadius: 'var(--gds-radius-full, 9999px)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--color-primary, #10b981)',
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          READY AT PASS
        </span>
      </div>

      {/* Timestamp & Item summary */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span>⏱️ Ordered {elapsedMinutes}m ago</span>
        <span>{totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}</span>
      </div>

      {/* Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm, 6px)',
              background: 'var(--color-surface-sunken)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--gds-font-mono, monospace)',
                fontWeight: 800,
                fontSize: '0.95rem',
                color: 'var(--color-primary, #10b981)',
                minWidth: '24px',
              }}
            >
              {item.quantity}×
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>
                {item.dishName || item.name}
              </div>
              {item.customizationNotes && (
                <div style={{ fontSize: '0.725rem', color: '#d97706', fontStyle: 'italic', marginTop: '2px' }}>
                  Note: {item.customizationNotes}
                </div>
              )}
            </div>
            {item.price && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--gds-font-mono, monospace)' }}>
                ₹{(item.price * (item.quantity || 1)).toFixed(2)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Order Notes (if any) */}
      {notes && (
        <div
          style={{
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm, 6px)',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            fontSize: '0.75rem',
            color: '#b45309',
          }}
        >
          <strong>Special Instructions:</strong> {notes}
        </div>
      )}

      {/* Total & Action */}
      <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
        <Button
          variant="primary"
          size="md"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          disabled={isProcessing}
          onClick={() => onMarkServed && onMarkServed(orderId)}
        >
          <span>🍽️</span>
          <span>{isProcessing ? 'Marking Served...' : 'Mark Served to Table'}</span>
        </Button>
      </div>
    </div>
  );
}

