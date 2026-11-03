import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order = null,
}) {
  if (!isOpen || !order) return null;

  const {
    orderId,
    orderNumber,
    tableNumber,
    status = 'COMPLETED',
    totalAmount = 0,
    notes,
    items = [],
    createdAt,
  } = order;

  const dateFormatted = createdAt
    ? new Date(createdAt).toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const getStatusColor = (st) => {
    switch (st) {
      case 'COMPLETED':
        return '#10b981';
      case 'SERVED':
        return '#3b82f6';
      case 'READY':
        return '#06b6d4';
      case 'PREPARING':
        return '#f59e0b';
      case 'PLACED':
        return '#8b5cf6';
      case 'CANCELLED':
        return '#ef4444';
      default:
        return 'var(--color-text-muted)';
    }
  };

  const statusColor = getStatusColor(status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Receipt: ${orderNumber || `#${orderId}`}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Order Meta Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-surface-sunken)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md, 8px)',
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)' }}>
              Table {tableNumber}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Placed: {dateFormatted}
            </div>
          </div>

          <span
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--gds-radius-full, 9999px)',
              background: `${statusColor}20`,
              border: `1px solid ${statusColor}40`,
              color: statusColor,
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {status}
          </span>
        </div>

        {/* Itemized charges table */}
        <div
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md, 8px)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              background: 'var(--color-surface-sunken)',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
            }}
          >
            Consolidated Order Line Items
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '220px', overflowY: 'auto' }}>
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderBottom: idx === items.length - 1 ? 'none' : '1px solid var(--color-border)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--gds-font-mono, monospace)',
                        fontWeight: 800,
                        color: 'var(--color-primary, #10b981)',
                      }}
                    >
                      {item.quantity}×
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9rem' }}>
                      {item.dishName}
                    </span>
                  </div>
                  {item.specialInstructions && (
                    <div style={{ fontSize: '0.75rem', color: '#d97706', fontStyle: 'italic', marginTop: '2px', paddingLeft: '24px' }}>
                      Note: {item.specialInstructions}
                    </div>
                  )}
                </div>

                <span style={{ fontFamily: 'var(--gds-font-mono, monospace)', fontWeight: 700, fontSize: '0.9rem' }}>
                  ₹{Number(item.itemTotal || (item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Special Instructions / Notes */}
        {notes && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm, 6px)',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              fontSize: '0.775rem',
              color: '#b45309',
            }}
          >
            <strong>Guest Notes:</strong> {notes}
          </div>
        )}

        {/* Total Summary Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '8px',
            borderTop: '2px solid var(--color-border)',
            fontSize: '1.15rem',
            fontWeight: 800,
          }}
        >
          <span style={{ color: 'var(--color-text)' }}>Total Session Amount:</span>
          <span style={{ color: 'var(--color-primary, #10b981)', fontFamily: 'var(--gds-font-mono, monospace)' }}>
            ₹{Number(totalAmount).toFixed(2)}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Receipt
          </Button>
        </div>
      </div>
    </Modal>
  );
}

