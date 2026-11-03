import React, { useState, useMemo } from 'react';
import TableCard from './TableCard';

export default function TableFloorGrid({
  tables = [],
  onStatusChange,
  onInitiateCheckout,
  onViewReadyOrders,
  onViewAssistance,
  processingActionIds = new Set(),
}) {
  const [filter, setFilter] = useState('ALL');

  const filteredTables = useMemo(() => {
    if (filter === 'ALL') return tables;
    return tables.filter((t) => t.status === filter);
  }, [tables, filter]);

  const counts = useMemo(() => {
    return {
      ALL: tables.length,
      OCCUPIED: tables.filter((t) => t.status === 'OCCUPIED').length,
      BILL_REQUESTED: tables.filter((t) => t.status === 'BILL_REQUESTED').length,
      AVAILABLE: tables.filter((t) => t.status === 'AVAILABLE').length,
      CLEANING_NEEDED: tables.filter((t) => t.status === 'CLEANING_NEEDED').length,
    };
  }, [tables]);

  const filterTabs = [
    { id: 'ALL', label: 'All Tables', count: counts.ALL },
    { id: 'OCCUPIED', label: 'Occupied', count: counts.OCCUPIED },
    { id: 'BILL_REQUESTED', label: 'Bill Requested', count: counts.BILL_REQUESTED, highlight: counts.BILL_REQUESTED > 0 },
    { id: 'AVAILABLE', label: 'Available', count: counts.AVAILABLE },
    { id: 'CLEANING_NEEDED', label: 'Cleaning Needed', count: counts.CLEANING_NEEDED },
  ];

  return (
    <div>
      {/* Filter Tabs Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '16px',
        }}
      >
        {filterTabs.map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--gds-radius-full, 9999px)',
                border: isActive
                  ? '1px solid var(--color-primary, #10b981)'
                  : '1px solid var(--color-border)',
                background: isActive
                  ? 'var(--color-primary, #10b981)'
                  : 'var(--color-surface)',
                color: isActive ? '#ffffff' : 'var(--color-text)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  padding: '2px 6px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--color-surface-sunken)',
                  color: isActive ? '#ffffff' : 'var(--color-text-muted)',
                  fontSize: '0.7rem',
                  fontFamily: 'var(--gds-font-mono, monospace)',
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of Tables */}
      {filteredTables.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg, 12px)',
            color: 'var(--color-text-muted)',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🪑</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--color-text)' }}>
            No Tables Found
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            No restaurant tables currently match the "{filter}" status filter.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onStatusChange={onStatusChange}
              onInitiateCheckout={onInitiateCheckout}
              onViewReadyOrders={onViewReadyOrders}
              onViewAssistance={onViewAssistance}
              isProcessing={
                processingActionIds.has(`table-status-${table.id}`) ||
                processingActionIds.has(`table-checkout-${table.id}`)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

