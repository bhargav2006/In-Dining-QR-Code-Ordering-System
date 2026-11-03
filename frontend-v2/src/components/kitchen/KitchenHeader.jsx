import React, { useState, useEffect } from 'react';
import CircularLogo from '../ui/CircularLogo';
import ThemeToggle from '../ui/ThemeToggle';
import KitchenConnectionStatus from './KitchenConnectionStatus';
import Button from '../ui/Button';

export default function KitchenHeader({
  restaurantName,
  operatorName = 'Head Chef',
  operatorRole = 'ROLE_KITCHEN',
  connectionStatus = 'connected',
  lastPolledAt,
  soundEnabled = false,
  onToggleSound,
  onRefresh,
  onLogout,
  onOpenLogin,
  isRefreshing = false,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock ticker updating every second
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
        {/* Left: Brand & Station Details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
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
                Kitchen Display System
              </h1>
              {restaurantName && (
                <span
                  style={{
                    background: 'var(--color-surface-sunken)',
                    border: '1px solid var(--color-border)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  🏪 {restaurantName}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '2px',
                flexWrap: 'wrap',
              }}
            >
              <span>
                Staff: <strong>{operatorName}</strong> ({operatorRole.replace('ROLE_', '')})
              </span>
              <span>•</span>
              <span style={{ fontFamily: 'var(--gds-font-mono, monospace)', fontWeight: 600 }}>
                {dateFormatted} — {timeFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Operational Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Connection Status indicator */}
          <KitchenConnectionStatus status={connectionStatus} lastPolledAt={lastPolledAt} />

          {/* Sound Alert Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--gds-radius-button, 8px)',
              background: soundEnabled ? 'rgba(16, 185, 129, 0.12)' : 'var(--color-surface-sunken)',
              border: soundEnabled ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--color-border)',
              color: soundEnabled ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={soundEnabled ? 'Audio alerts active for new incoming tickets' : 'Muted (Click to enable audio chime)'}
          >
            <span>{soundEnabled ? '🔔 Chime On' : '🔕 Chime Muted'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--gds-radius-button, 8px)',
              background: 'var(--color-surface-sunken)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Force refresh queue from backend"
          >
            <span
              style={{
                display: 'inline-block',
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              }}
            >
              🔄
            </span>
            <span>Refresh</span>
          </button>

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Staff Auth Button */}
          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: 'var(--gds-radius-button, 8px)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Sign out from kitchen session"
            >
              <span>🚪 Sign Out</span>
            </button>
          ) : (
            <Button variant="secondary" size="sm" onClick={onOpenLogin}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

