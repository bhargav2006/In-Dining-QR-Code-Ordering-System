import React from 'react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: '📊', description: 'Real-time sales & KPIs' },
  { id: 'categories', label: 'Categories', icon: '🗂️', description: 'Menu sections & order' },
  { id: 'dishes', label: 'Dishes & Menu', icon: '🍽️', description: 'Item pricing & 86ing' },
  { id: 'tables', label: 'Tables & QR', icon: '🪑', description: 'Table setup & QR codes' },
  { id: 'orders', label: 'Order History', icon: '🧾', description: 'Consolidated guest receipts' },
];

export default function ManagerSidebar({
  activeSection = 'overview',
  onSelectSection,
  counts = {},
  isMobileOpen = false,
  onCloseMobile,
}) {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px 12px',
        boxSizing: 'border-box',
        gap: '8px',
      }}
    >
      <div style={{ padding: '0 8px 12px', borderBottom: '1px solid var(--color-border)' }}>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Management Console
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          const count = counts[item.id];

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectSection(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md, 8px)',
                border: isActive
                  ? '1px solid var(--color-primary, #10b981)'
                  : '1px solid transparent',
                background: isActive
                  ? 'rgba(16, 185, 129, 0.12)'
                  : 'transparent',
                color: isActive ? 'var(--color-primary, #10b981)' : 'var(--color-text)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: isActive ? 800 : 600 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    {item.description}
                  </div>
                </div>
              </div>

              {count != null && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--gds-radius-full, 9999px)',
                    background: isActive ? 'var(--color-primary, #10b981)' : 'var(--color-surface-sunken)',
                    color: isActive ? '#ffffff' : 'var(--color-text-muted)',
                    fontSize: '0.725rem',
                    fontFamily: 'var(--gds-font-mono, monospace)',
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: 'auto',
          padding: '12px',
          borderRadius: 'var(--radius-md, 8px)',
          background: 'var(--color-surface-sunken)',
          border: '1px solid var(--color-border)',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
          lineHeight: 1.4,
        }}
      >
        <div style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>
          🛡️ Tenant Isolation Active
        </div>
        Changes made in this portal apply strictly to your authenticated restaurant branch.
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className="manager-desktop-sidebar"
        style={{
          width: '260px',
          flexShrink: 0,
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {content}
      </aside>

      {/* Mobile / Tablet Drawer Overlay */}
      {isMobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
          }}
        >
          <div
            onClick={onCloseMobile}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(2px)',
            }}
          />
          <div
            style={{
              position: 'relative',
              width: '280px',
              maxWidth: '80%',
              height: '100%',
              background: 'var(--color-surface)',
              borderRight: '1px solid var(--color-border)',
              zIndex: 51,
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 12px 0' }}>
              <button
                onClick={onCloseMobile}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                }}
              >
                ✕
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}

