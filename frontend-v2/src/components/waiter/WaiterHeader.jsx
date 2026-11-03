import React, { useState, useEffect } from 'react';
import CircularLogo from '../ui/CircularLogo';
import ThemeToggle from '../ui/ThemeToggle';
import WaiterConnectionStatus from './WaiterConnectionStatus';
import Button from '../ui/Button';

export default function WaiterHeader({
  restaurantName = 'Tasty Tacos',
  operatorName = 'Lead Waiter',
  operatorRole = 'ROLE_WAITER',
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
                Floor Portal
              </h1>
              {restaurantName && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--gds-radius-full, 9999px)',
                    background: 'var(--color-primary-light, rgba(16, 185, 129, 0.12))',
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

        {/* Center / Operational Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <WaiterConnectionStatus status={connectionStatus} lastPolledAt={lastPolledAt} />

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${soundEnabled ? 'var(--color-primary, #10b981)' : 'var(--color-border)'}`,
              background: soundEnabled ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-surface-sunken)',
              color: soundEnabled ? 'var(--color-primary, #10b981)' : 'var(--color-text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title={soundEnabled ? 'Floor chimes enabled' : 'Floor chimes muted'}
            aria-label="Toggle waiter audio chimes"
          >
            <span>{soundEnabled ? '🔔' : '🔕'}</span>
            <span style={{ display: 'none', sm: 'inline' }}>
              {soundEnabled ? 'Sound On' : 'Muted'}
            </span>
          </button>

          {/* Manual Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Refresh floor data"
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

        {/* Right: Staff Identity & Actions */}
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
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--gds-font-mono, monospace)',
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
                title="Sign out of Waiter station"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="primary" size="sm" onClick={onOpenLogin}>
              Staff Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

