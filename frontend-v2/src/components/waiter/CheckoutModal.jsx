import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import waiterService from '../../services/waiterService';

export default function CheckoutModal({
  isOpen,
  onClose,
  table,
  onConfirmCheckout,
  isProcessing = false,
}) {
  const [bill, setBill] = useState(null);
  const [loadingBill, setLoadingBill] = useState(false);
  const [errorBill, setErrorBill] = useState(null);

  useEffect(() => {
    if (!isOpen || !table) {
      setBill(null);
      setErrorBill(null);
      return;
    }

    if (table.activeSessionToken) {
      setLoadingBill(true);
      setErrorBill(null);
      waiterService
        .getBillReceipt(table.activeSessionToken)
        .then((data) => {
          setBill(data);
        })
        .catch((err) => {
          console.warn('Could not load bill receipt for table:', err.message);
          setErrorBill('No active order items found or receipt already closed.');
        })
        .finally(() => {
          setLoadingBill(false);
        });
    } else {
      setBill(null);
      setLoadingBill(false);
    }
  }, [isOpen, table]);

  if (!table) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isProcessing ? undefined : onClose}
      title={`Checkout Table ${table.tableNumber}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Table summary badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-surface-sunken)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md, 8px)',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
              Table {table.tableNumber}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--gds-font-mono, monospace)' }}>
              Session: {table.activeSessionToken || 'None'}
            </div>
          </div>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--gds-radius-full, 9999px)',
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#3b82f6',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {table.status}
          </span>
        </div>

        {/* Bill Breakdown */}
        {loadingBill ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            <span>🧾 Fetching itemized bill receipt...</span>
          </div>
        ) : bill ? (
          <div
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '12px 14px',
              background: 'var(--color-surface)',
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Itemized Charges
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
              {(bill.items || []).map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ color: 'var(--color-text)' }}>
                    {item.quantity}× {item.dishName || item.name}
                  </span>
                  <span style={{ fontFamily: 'var(--gds-font-mono, monospace)', fontWeight: 600 }}>
                    ₹{Number(item.itemTotal || (item.price || item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '12px',
                paddingTop: '8px',
                borderTop: '1px dashed var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
              }}
            >
              {bill.subtotal != null && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span style={{ fontFamily: 'var(--gds-font-mono, monospace)' }}>₹{Number(bill.subtotal).toFixed(2)}</span>
                </div>
              )}
              {bill.taxAmount != null && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tax / GST:</span>
                  <span style={{ fontFamily: 'var(--gds-font-mono, monospace)' }}>₹{Number(bill.taxAmount).toFixed(2)}</span>
                </div>
              )}
              {bill.tipAmount != null && Number(bill.tipAmount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tip:</span>
                  <span style={{ fontFamily: 'var(--gds-font-mono, monospace)' }}>₹{Number(bill.tipAmount).toFixed(2)}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '6px',
                  borderTop: '1px solid var(--color-border)',
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--color-text)',
                }}
              >
                <span>Total Amount:</span>
                <span style={{ color: 'var(--color-primary, #10b981)', fontFamily: 'var(--gds-font-mono, monospace)' }}>
                  ₹{Number(bill.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ) : errorBill ? (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm, 6px)',
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#b45309',
              fontSize: '0.8rem',
            }}
          >
            {errorBill}
          </div>
        ) : (
          <div style={{ padding: '8px 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            This table does not have an active guest order bill.
          </div>
        )}

        {/* Warning & Instructions */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm, 6px)',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '0.775rem',
            color: 'var(--color-text)',
            lineHeight: 1.4,
          }}
        >
          <strong>Confirming Checkout will:</strong>
          <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
            <li>Mark all active orders for this table as COMPLETED.</li>
            <li>Close the active guest session token.</li>
            <li>Reset table status to <strong>AVAILABLE</strong> for new guests.</li>
          </ul>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Button variant="outline" size="md" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={isProcessing}
            onClick={() => onConfirmCheckout && onConfirmCheckout(table.id)}
            style={{ minWidth: '160px' }}
          >
            {isProcessing ? 'Processing Checkout...' : 'Confirm & Release Table'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

