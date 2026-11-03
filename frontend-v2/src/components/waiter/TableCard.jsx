import React from 'react';
import TableStatusBadge from './TableStatusBadge';
import Button from '../ui/Button';

const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'BILL_REQUESTED', label: 'Bill Requested' },
  { value: 'CLEANING_NEEDED', label: 'Cleaning Needed' },
];

export default function TableCard({
  table,
  onStatusChange,
  onInitiateCheckout,
  onViewReadyOrders,
  onViewAssistance,
  isProcessing = false,
}) {
  const {
    id,
    tableNumber,
    capacity,
    status = 'AVAILABLE',
    activeSessionToken,
    readyOrdersCount = 0,
    pendingAssistanceCount = 0,
    assistanceList = [],
  } = table;

  const isOccupied = status === 'OCCUPIED' || status === 'BILL_REQUESTED';
  const hasReadyOrders = readyOrdersCount > 0;
  const hasAssistance = pendingAssistanceCount > 0;
  const isCleaning = status === 'CLEANING_NEEDED';

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: hasAssistance || status === 'BILL_REQUESTED'
          ? '2px solid #f59e0b'
          : hasReadyOrders
          ? '2px solid #3b82f6'
          : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        boxShadow: hasAssistance || status === 'BILL_REQUESTED'
          ? '0 0 16px rgba(245, 158, 11, 0.15)'
          : 'var(--shadow-sm)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header: Table Number & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
            }}
          >
            Table {tableNumber}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              fontWeight: 600,
            }}
          >
            👥 {capacity} Seats
          </span>
        </div>
        <TableStatusBadge status={status} size="sm" />
      </div>

      {/* Active Alerts for this Table */}
      {(hasReadyOrders || hasAssistance) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {hasReadyOrders && (
            <button
              onClick={() => onViewReadyOrders && onViewReadyOrders(tableNumber)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: 'var(--radius-md, 8px)',
                background: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#3b82f6',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>🍽️ {readyOrdersCount} {readyOrdersCount === 1 ? 'Dish' : 'Dishes'} Ready at Kitchen!</span>
              <span>Serve →</span>
            </button>
          )}

          {hasAssistance && (
            <button
              onClick={() => onViewAssistance && onViewAssistance(tableNumber)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: 'var(--radius-md, 8px)',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#f59e0b',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>
                🔔 {assistanceList[0]?.requestType || 'Assistance'} Call
                {assistanceList[0]?.additionalNotes ? ` ("${assistanceList[0].additionalNotes.slice(0, 15)}...")` : ''}
              </span>
              <span>Attend →</span>
            </button>
          )}
        </div>
      )}

      {/* Session Details */}
      <div
        style={{
          background: 'var(--color-surface-sunken)',
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm, 6px)',
          fontSize: '0.725rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--gds-font-mono, monospace)',
        }}
      >
        <span>SESSION:</span>
        <span style={{ fontWeight: 600, color: activeSessionToken ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
          {activeSessionToken ? activeSessionToken : 'No Active Session'}
        </span>
      </div>

      {/* Manual Status Override Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label
          htmlFor={`status-select-${id}`}
          style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}
        >
          Change Status:
        </label>
        <select
          id={`status-select-${id}`}
          value={status}
          disabled={isProcessing}
          onChange={(e) => onStatusChange && onStatusChange(id, e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: isProcessing ? 'not-allowed' : 'pointer',
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Primary Action Button */}
      <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
        {isCleaning ? (
          <Button
            variant="outline"
            size="sm"
            style={{ width: '100%', borderColor: '#ec4899', color: '#ec4899' }}
            disabled={isProcessing}
            onClick={() => onStatusChange && onStatusChange(id, 'AVAILABLE')}
          >
            ✨ Clean & Release Table
          </Button>
        ) : isOccupied || activeSessionToken ? (
          <Button
            variant="primary"
            size="sm"
            style={{
              width: '100%',
              background: status === 'BILL_REQUESTED' ? '#f59e0b' : undefined,
              borderColor: status === 'BILL_REQUESTED' ? '#d97706' : undefined,
            }}
            disabled={isProcessing}
            onClick={() => onInitiateCheckout && onInitiateCheckout(table)}
          >
            💳 Checkout & Liberate
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            style={{ width: '100%' }}
            disabled={isProcessing}
            onClick={() => onStatusChange && onStatusChange(id, 'OCCUPIED')}
          >
            Seat Guests
          </Button>
        )}
      </div>
    </div>
  );
}

