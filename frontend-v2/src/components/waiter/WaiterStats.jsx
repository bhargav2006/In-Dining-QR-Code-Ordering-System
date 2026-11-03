import React from 'react';

export default function WaiterStats({ stats, activeTab, onSelectTab }) {
  const {
    totalTables = 0,
    occupiedCount = 0,
    billRequestedCount = 0,
    cleaningNeededCount = 0,
    availableCount = 0,
    readyOrdersCount = 0,
    pendingAssistanceCount = 0,
    occupancyRate = 0,
  } = stats || {};

  const cards = [
    {
      id: 'floor',
      label: 'Floor Occupancy',
      value: `${occupancyRate}%`,
      subtitle: `${occupiedCount + billRequestedCount} of ${totalTables} tables occupied`,
      icon: '🪑',
      color: 'var(--color-primary, #10b981)',
      bg: 'rgba(16, 185, 129, 0.08)',
    },
    {
      id: 'ready',
      label: 'Ready to Serve',
      value: readyOrdersCount,
      subtitle: readyOrdersCount > 0 ? 'Food waiting at pass' : 'No tickets waiting',
      icon: '🍽️',
      color: readyOrdersCount > 0 ? '#3b82f6' : 'var(--color-text-muted)',
      bg: readyOrdersCount > 0 ? 'rgba(59, 130, 246, 0.12)' : 'var(--color-surface-sunken)',
      badge: readyOrdersCount > 0 ? 'SERVE NOW' : null,
      pulse: readyOrdersCount > 0,
    },
    {
      id: 'assistance',
      label: 'Assistance Calls',
      value: pendingAssistanceCount,
      subtitle: billRequestedCount > 0 ? `${billRequestedCount} bill requests active` : (pendingAssistanceCount > 0 ? 'Guests waiting' : 'All clear'),
      icon: '🔔',
      color: pendingAssistanceCount > 0 ? '#f59e0b' : 'var(--color-text-muted)',
      bg: pendingAssistanceCount > 0 ? 'rgba(245, 158, 11, 0.12)' : 'var(--color-surface-sunken)',
      badge: pendingAssistanceCount > 0 ? 'ATTEND' : null,
      pulse: pendingAssistanceCount > 0,
    },
    {
      id: 'cleaning',
      label: 'Cleaning Needed',
      value: cleaningNeededCount,
      subtitle: `${availableCount} tables available for seating`,
      icon: '🧹',
      color: cleaningNeededCount > 0 ? '#ec4899' : 'var(--color-text-muted)',
      bg: cleaningNeededCount > 0 ? 'rgba(236, 72, 153, 0.12)' : 'var(--color-surface-sunken)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '20px',
      }}
    >
      {cards.map((card) => {
        const isSelected = activeTab === card.id;
        return (
          <div
            key={card.id}
            onClick={() => onSelectTab && onSelectTab(card.id)}
            style={{
              background: 'var(--color-surface)',
              border: isSelected
                ? `2px solid ${card.color}`
                : '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: onSelectTab ? 'pointer' : 'default',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  {card.label}
                </span>
                {card.badge && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: card.color,
                      color: '#ffffff',
                      animation: card.pulse ? 'pulse 1.5s infinite' : 'none',
                    }}
                  >
                    {card.badge}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: card.value > 0 || card.id === 'floor' ? 'var(--color-text)' : 'var(--color-text-muted)',
                  fontFamily: 'var(--gds-font-mono, monospace)',
                  lineHeight: 1.1,
                }}
              >
                {card.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                {card.subtitle}
              </div>
            </div>

            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md, 8px)',
                background: card.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                flexShrink: 0,
              }}
            >
              {card.icon}
            </div>
          </div>
        );
      })}
    </div>
  );
}

