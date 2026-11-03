import React from 'react';

export default function ManagerStats({ analytics }) {
  const {
    todaySales = 0,
    todayOrdersCount = 0,
    yesterdaySales = 0,
    yesterdayOrdersCount = 0,
    allTimeSales = 0,
    allTimeOrdersCount = 0,
    activeTablesCount = 0,
    totalTablesCount = 0,
    pendingOrdersCount = 0,
  } = analytics || {};

  const avgTicket = allTimeOrdersCount > 0 ? (Number(allTimeSales) / Number(allTimeOrdersCount)).toFixed(2) : '0.00';
  const occupancyPercent = totalTablesCount > 0 ? Math.round((Number(activeTablesCount) / Number(totalTablesCount)) * 100) : 0;

  const statCards = [
    {
      id: 'today-sales',
      label: "Today's Gross Revenue",
      value: `₹${Number(todaySales).toFixed(2)}`,
      subtext: `${todayOrdersCount} orders placed today`,
      icon: '💰',
      color: 'var(--color-primary, #10b981)',
      bg: 'rgba(16, 185, 129, 0.1)',
      badge: todaySales > 0 ? 'ACTIVE' : null,
    },
    {
      id: 'all-time-sales',
      label: 'All-Time Gross Sales',
      value: `₹${Number(allTimeSales).toFixed(2)}`,
      subtext: `${allTimeOrdersCount} total customer orders`,
      icon: '📈',
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)',
    },
    {
      id: 'avg-ticket',
      label: 'Average Order Value (AOV)',
      value: `₹${avgTicket}`,
      subtext: 'Calculated across all orders',
      icon: '🧾',
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)',
    },
    {
      id: 'occupancy',
      label: 'Floor Occupancy',
      value: `${occupancyPercent}%`,
      subtext: `${activeTablesCount} of ${totalTablesCount} tables seated`,
      icon: '🪑',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
    {
      id: 'pending-tickets',
      label: 'Active Kitchen Tickets',
      value: pendingOrdersCount,
      subtext: pendingOrdersCount > 0 ? 'Orders in line or ready' : 'Kitchen line clear',
      icon: '🍳',
      color: pendingOrdersCount > 0 ? '#ef4444' : 'var(--color-text-muted)',
      bg: pendingOrdersCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-surface-sunken)',
      badge: pendingOrdersCount > 0 ? 'IN PROGRESS' : null,
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {statCards.map((card) => (
        <div
          key={card.id}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg, 12px)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                {card.label}
              </span>
              {card.badge && (
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: card.color,
                    color: '#ffffff',
                  }}
                >
                  {card.badge}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                color: 'var(--color-text)',
                fontFamily: 'var(--gds-font-mono, monospace)',
                lineHeight: 1.1,
              }}
            >
              {card.value}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              {card.subtext}
            </div>
          </div>

          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md, 8px)',
              background: card.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              flexShrink: 0,
            }}
          >
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}

