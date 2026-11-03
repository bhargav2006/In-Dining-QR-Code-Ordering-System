import React, { useState, useEffect } from 'react';
import CircularLogo from '../ui/CircularLogo';
import ThemeToggle from '../ui/ThemeToggle';
import Button from '../ui/Button';

export default function ManagerHeader({
  restaurantName = 'Tasty Tacos',
  operatorName = 'Restaurant Manager',
  operatorRole = 'ROLE_ADMIN',
  onRefresh,
  onLogout,
  onOpenLogin,
  isRefreshing = false,
  onToggleMobileMenu,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeFormatted = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateFormatted = currentTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header
      style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '12px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Left: Mobile Menu Toggle + Brand Details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-sunken)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                fontSize: '1.2rem',
              }}
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>
          )}

          <CircularLogo size={42} />

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--color-text)',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                Manager Portal
              </h1>
              {restaurantName && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--gds-radius-full, 9999px)',
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: 'var(--color-primary, #10b981)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                  }}
                >
                  {restaurantName}
                </span>
              )}
            </div>
            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{dateFormatted}</span>
              <span>•</span>
              <span style={{ fontFamily: 'var(--gds-font-mono, monospace)', fontWeight: 600 }}>
                {timeFormatted}
              </span>
            </p>
          </div>
        </div>

        {/* Center / Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Manual Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Refresh administrative data"
          >
            <span
              style={{
                display: 'inline-block',
                transform: isRefreshing ? 'rotate(360deg)' : 'none',
                transition: isRefreshing ? 'transform 0.8s linear' : 'none',
              }}
            >
              🔄
            </span>
            <span>Refresh</span>
          </Button>

          <ThemeToggle />
        </div>

        {/* Right: Staff Identity & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {operatorName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  {operatorName}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--color-primary, #10b981)',
                    fontFamily: 'var(--gds-font-mono, monospace)',
                    fontWeight: 700,
                  }}
                >
                  {operatorRole.replace('ROLE_', '')}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                title="Sign out of Administration portal"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="primary" size="sm" onClick={onOpenLogin}>
              Admin Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

