import React, { useState, useEffect } from 'react';

export default function KitchenOrderCard({
  order,
  onStartPreparing,
  onMarkReady,
  isProcessing = false,
}) {
  const { orderId, orderNumber, tableNumber, status, notes, items = [], createdAt } = order;

  // Live elapsed minutes ticker
  const [elapsedMinutes, setElapsedMinutes] = useState(() => {
    if (!createdAt) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
  });

  useEffect(() => {
    if (!createdAt) return;
    const updateElapsed = () => {
      setElapsedMinutes(Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)));
    };
    const interval = setInterval(updateElapsed, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [createdAt]);

  const isPlaced = status === 'PLACED';
  const isPreparing = status === 'PREPARING';

  // Urgency styling based on wait time
  const isUrgent = elapsedMinutes >= 20;
  const isWarning = elapsedMinutes >= 10 && elapsedMinutes < 20;

  const waitBadgeColor = isUrgent
    ? '#ef4444'
    : isWarning
    ? '#d97706'
    : 'var(--color-text-muted)';

  const waitBadgeBg = isUrgent
    ? 'rgba(239, 68, 68, 0.12)'
    : isWarning
    ? 'rgba(217, 119, 6, 0.12)'
    : 'var(--color-surface-sunken)';

  const waitBadgeBorder = isUrgent
    ? '1px solid rgba(239, 68, 68, 0.35)'
    : isWarning
    ? '1px solid rgba(217, 119, 6, 0.35)'
    : '1px solid var(--color-border)';

  // Border & Header accent color based on status
  const cardBorder = isPlaced
    ? '2px solid rgba(217, 119, 6, 0.5)' // Amber
    : '2px solid rgba(2, 132, 199, 0.5)'; // Blue

  const cardHeaderBg = isPlaced
    ? 'rgba(217, 119, 6, 0.08)'
    : 'rgba(2, 132, 199, 0.08)';

  return (
    <article
      style={{
        background: 'var(--color-surface)',
        border: cardBorder,
        borderRadius: 'var(--gds-radius-2xl, 16px)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {/* Ticket Header: Table + Time */}
      <div
        style={{
          background: cardHeaderBg,
          borderBottom: '1px solid var(--color-border)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              fontFamily: 'var(--gds-font-sans)',
              letterSpacing: '-0.02em',
            }}
          >
            TABLE #{tableNumber || '?'}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--gds-font-mono, monospace)',
            }}
          >
            #{orderNumber || orderId}
          </span>
        </div>

        {/* Elapsed Timer Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: 'var(--gds-radius-full, 9999px)',
            background: waitBadgeBg,
            border: waitBadgeBorder,
            color: waitBadgeColor,
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: 'var(--gds-font-mono, monospace)',
          }}
          title={createdAt ? `Order received at ${new Date(createdAt).toLocaleTimeString()}` : ''}
        >
          <span>⏱️</span>
          <span>{elapsedMinutes}m ago</span>
          {isUrgent && <span style={{ color: '#ef4444', fontWeight: 800 }}>RUSH!</span>}
        </div>
      </div>

      {/* Ticket Body: Item List */}
      <div style={{ padding: '16px', flex: '1 1 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                paddingBottom: idx < items.length - 1 ? '10px' : '0',
                borderBottom: idx < items.length - 1 ? '1px dashed var(--color-divider)' : 'none',
              }}
            >
              {/* High-visibility Quantity Pill */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '32px',
                  height: '32px',
                  padding: '0 6px',
                  background: 'var(--color-primary-container, rgba(16, 185, 129, 0.15))',
                  color: 'var(--color-on-primary-container, #10b981)',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  fontFamily: 'var(--gds-font-mono, monospace)',
                  flexShrink: 0,
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                {item.quantity}×
              </span>

              {/* Dish Name & Notes */}
              <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    lineHeight: 1.3,
                  }}
                >
                  {item.dishName}
                </div>

                {/* Item-specific special cooking instructions */}
                {item.specialInstructions && item.specialInstructions.trim() !== '' && (
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '4px 8px',
                      background: 'rgba(217, 119, 6, 0.1)',
                      border: '1px solid rgba(217, 119, 6, 0.3)',
                      borderRadius: '6px',
                      color: '#d97706',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>⚠️</span>
                    <span>Note: {item.specialInstructions}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Global Order Note (if any) */}
        {notes && notes.trim() !== '' && notes !== 'Customer online order' && (
          <div
            style={{
              marginTop: '14px',
              padding: '8px 12px',
              background: 'var(--color-surface-sunken)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
            }}
          >
            <strong>Customer Note:</strong> {notes}
          </div>
        )}
      </div>

      {/* Ticket Action Footer */}
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--color-surface-sunken)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        {isPlaced && (
          <button
            type="button"
            onClick={() => onStartPreparing(orderId)}
            disabled={isProcessing}
            style={{
              width: '100%',
              minHeight: '48px', // Touch-friendly target
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--gds-radius-button, 10px)',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.35)',
              transition: 'all 0.15s ease',
              opacity: isProcessing ? 0.7 : 1,
            }}
          >
            {isProcessing ? (
              <span>⏳ Updating...</span>
            ) : (
              <>
                <span style={{ fontSize: '1.1rem' }}>▶</span>
                <span>START PREPARATION</span>
              </>
            )}
          </button>
        )}

        {isPreparing && (
          <button
            type="button"
            onClick={() => onMarkReady(orderId)}
            disabled={isProcessing}
            style={{
              width: '100%',
              minHeight: '48px', // Touch-friendly target
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--gds-radius-button, 10px)',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.15s ease',
              opacity: isProcessing ? 0.7 : 1,
            }}
          >
            {isProcessing ? (
              <span>⏳ Updating...</span>
            ) : (
              <>
                <span style={{ fontSize: '1.2rem' }}>✔</span>
                <span>MARK READY FOR SERVICE</span>
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
