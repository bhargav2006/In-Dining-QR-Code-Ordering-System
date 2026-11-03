import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function TableModal({
  isOpen,
  onClose,
  table = null,
  onSave,
  isProcessing = false,
}) {
  const isEditing = Boolean(table?.id);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [error, setError] = useState('');

  useEffect(() => {
    if (table) {
      setTableNumber(String(table.tableNumber || ''));
      setCapacity(String(table.capacity || '4'));
    } else {
      setTableNumber('');
      setCapacity('4');
    }
    setError('');
  }, [table, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = Number(tableNumber);
    const cap = Number(capacity);

    if (!num || num <= 0) {
      setError('Please provide a valid table number greater than 0.');
      return;
    }
    if (!cap || cap <= 0) {
      setError('Please provide a valid seating capacity greater than 0.');
      return;
    }

    try {
      setError('');
      await onSave({
        id: table?.id,
        tableNumber: num,
        capacity: cap,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save table');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isProcessing ? undefined : onClose}
      title={isEditing ? `Edit Table ${table.tableNumber}` : 'Add Dining Table'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md, 8px)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="table-num" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
            Table Number *
          </label>
          <input
            id="table-num"
            type="number"
            min="1"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            disabled={isProcessing}
            placeholder="e.g. 6"
            required
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.9rem',
              fontFamily: 'var(--gds-font-mono, monospace)',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="table-cap" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
            Seating Capacity (Guests) *
          </label>
          <select
            id="table-cap"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            disabled={isProcessing}
            required
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.9rem',
            }}
          >
            <option value="2">2 Seats (Couple / Intimate)</option>
            <option value="4">4 Seats (Standard Dining)</option>
            <option value="6">6 Seats (Family Table)</option>
            <option value="8">8 Seats (Large Group)</option>
            <option value="10">10+ Seats (Banquet / Party)</option>
          </select>
        </div>

        {!isEditing && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md, 8px)',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.75rem',
              color: 'var(--color-text)',
              lineHeight: 1.4,
            }}
          >
            💡 A unique, cryptographically-secure dining QR token will automatically be generated and bound to this table upon creation.
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
          <Button variant="outline" type="button" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isProcessing}>
            {isProcessing ? 'Saving...' : isEditing ? 'Update Table' : 'Create Table'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

