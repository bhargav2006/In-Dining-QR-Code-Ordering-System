import React, { useState, useMemo } from 'react';
import Button from '../ui/Button';
import OrderDetailsModal from './OrderDetailsModal';

export default function OrderHistory({ orders = [] }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== 'ALL' && order.status !== statusFilter) {
        return false;
      }
      // Search query (order number or table)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesNum = order.orderNumber?.toLowerCase().includes(query);
        const matchesTable = String(order.tableNumber).includes(query);
        const matchesNotes = order.notes?.toLowerCase().includes(query);
        if (!matchesNum && !matchesTable && !matchesNotes) return false;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const getStatusBadge = (st) => {
    const config = {
      COMPLETED: { label: 'COMPLETED', bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981' },
      SERVED: { label: 'SERVED', bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' },
      READY: { label: 'READY', bg: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' },
      PREPARING: { label: 'PREPARING', bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' },
      PLACED: { label: 'PLACED', bg: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' },
      CANCELLED: { label: 'CANCELLED', bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' },
    }[st] || { label: st, bg: 'var(--color-surface-sunken)', color: 'var(--color-text-muted)' };

    return (
      <span
        style={{
          display: 'inline-block',
          padding: '3px 8px',
          borderRadius: 'var(--gds-radius-full, 9999px)',
          background: config.bg,
          color: config.color,
          fontSize: '0.725rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header */}
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--color-text)' }}>
          Order History & Audit Logs ({orders.length})
        </h2>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          Review consolidated guest orders, itemized receipts, and table revenue history.
        </p>
      </div>

      {/* Filter toolbar */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '12px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '240px', flex: 1 }}>
          <span style={{ fontSize: '1rem' }}>🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order # (e.g. ORD-C02709F3) or table..."
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-sunken)',
              color: 'var(--color-text)',
              fontSize: '0.85rem',
            }}
          />
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {['ALL', 'COMPLETED', 'READY', 'PREPARING', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--gds-radius-full, 9999px)',
                border: statusFilter === st
                  ? '1px solid var(--color-primary, #10b981)'
                  : '1px solid var(--color-border)',
                background: statusFilter === st
                  ? 'var(--color-primary, #10b981)'
                  : 'transparent',
                color: statusFilter === st ? '#ffffff' : 'var(--color-text-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg, 12px)',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🧾</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--color-text)' }}>
            No Orders Found
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            No orders match the selected filters.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg, 12px)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr
                  style={{
                    background: 'var(--color-surface-sunken)',
                    borderBottom: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <th style={{ padding: '12px 16px' }}>Order Ticket</th>
                  <th style={{ padding: '12px 16px' }}>Table</th>
                  <th style={{ padding: '12px 16px' }}>Timestamp</th>
                  <th style={{ padding: '12px 16px' }}>Items Summary</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const itemsCount = (order.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);
                  const dateStr = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'N/A';

                  return (
                    <tr
                      key={order.orderId}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--gds-font-mono, monospace)', fontWeight: 700 }}>
                        {order.orderNumber || `#${order.orderId}`}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                        Table {order.tableNumber}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                        {dateStr}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text)' }}>
                          {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                        </span>
                        {order.items && order.items.length > 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '6px' }}>
                            ({order.items.slice(0, 2).map((i) => `${i.quantity}× ${i.dishName}`).join(', ')}
                            {order.items.length > 2 ? '...' : ''})
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {getStatusBadge(order.status)}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          textAlign: 'right',
                          fontFamily: 'var(--gds-font-mono, monospace)',
                          fontWeight: 800,
                          color: 'var(--color-text)',
                        }}
                      >
                        ₹{Number(order.totalAmount || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View Receipt
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Receipt Modal */}
      <OrderDetailsModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
}

