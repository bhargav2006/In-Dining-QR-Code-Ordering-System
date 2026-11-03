import React, { useState } from 'react';
import KitchenOrderColumn from './KitchenOrderColumn';

export default function KitchenOrderBoard({
  placedOrders = [],
  preparingOrders = [],
  onStartPreparing,
  onMarkReady,
  processingOrderIds,
}) {
  const [mobileTab, setMobileTab] = useState('placed'); // 'placed' | 'preparing' | 'all'

  const totalActive = placedOrders.length + preparingOrders.length;

  if (totalActive === 0) {
    return (
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--gds-radius-2xl, 16px)',
          padding: '60px 24px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✨</div>
        <h3
          style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: 'var(--color-text)',
            marginBottom: '8px',
          }}
        >
          Kitchen Queue is Clear!
        </h3>
        <p
          style={{
            fontSize: '0.95rem',
            color: 'var(--color-text-muted)',
            maxWidth: '460px',
            margin: '0 auto',
            lineHeight: 1.5,
          }}
        >
          No pending orders waiting for preparation. Incoming customer orders will appear automatically here with live audio alerts.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile-only Segmented Filter Tabs */}
      <div
        className="kds-mobile-tabs"
        style={{
          display: 'none', // Overridden in CSS media queries
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            background: 'var(--color-surface-sunken)',
            padding: '4px',
            borderRadius: 'var(--gds-radius-xl, 12px)',
            border: '1px solid var(--color-border)',
          }}
        >
          <button
            type="button"
            onClick={() => setMobileTab('placed')}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              background: mobileTab === 'placed' ? '#d97706' : 'transparent',
              color: mobileTab === 'placed' ? '#ffffff' : 'var(--color-text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>🔔 Incoming</span>
            <span
              style={{
                background: mobileTab === 'placed' ? 'rgba(0,0,0,0.25)' : 'var(--color-surface)',
                padding: '1px 6px',
                borderRadius: '999px',
                fontSize: '0.75rem',
              }}
            >
              {placedOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('preparing')}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              background: mobileTab === 'preparing' ? '#0284c7' : 'transparent',
              color: mobileTab === 'preparing' ? '#ffffff' : 'var(--color-text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>🍳 In Preparation</span>
            <span
              style={{
                background: mobileTab === 'preparing' ? 'rgba(0,0,0,0.25)' : 'var(--color-surface)',
                padding: '1px 6px',
                borderRadius: '999px',
                fontSize: '0.75rem',
              }}
            >
              {preparingOrders.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Kanban Board (2 Columns on Desktop/Tablet, Responsive on Mobile) */}
      <div
        className="kds-board-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 'var(--gds-space-4, 20px)',
          alignItems: 'start',
        }}
      >
        {/* Column 1: Incoming Orders (PLACED) */}
        <div className={`kds-col-placed ${mobileTab === 'preparing' ? 'kds-hide-on-mobile' : ''}`}>
          <KitchenOrderColumn
            title="Incoming Orders"
            count={placedOrders.length}
            orders={placedOrders}
            status="PLACED"
            onStartPreparing={onStartPreparing}
            onMarkReady={onMarkReady}
            processingOrderIds={processingOrderIds}
            emptyMessage="No new incoming orders"
            emptyIcon="🔔"
            accentColor="#d97706"
          />
        </div>

        {/* Column 2: In Preparation (PREPARING) */}
        <div className={`kds-col-preparing ${mobileTab === 'placed' ? 'kds-hide-on-mobile' : ''}`}>
          <KitchenOrderColumn
            title="In Preparation"
            count={preparingOrders.length}
            orders={preparingOrders}
            status="PREPARING"
            onStartPreparing={onStartPreparing}
            onMarkReady={onMarkReady}
            processingOrderIds={processingOrderIds}
            emptyMessage="No orders currently being prepared"
            emptyIcon="🍳"
            accentColor="#0284c7"
          />
        </div>
      </div>
    </div>
  );
}

