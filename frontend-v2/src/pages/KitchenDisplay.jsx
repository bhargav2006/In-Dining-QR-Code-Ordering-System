import React, { useState, useMemo } from 'react';
import { useStaffAuth } from '../context/StaffAuthContext';
import { useKitchenOrders } from '../hooks/useKitchenOrders';
import KitchenHeader from '../components/kitchen/KitchenHeader';
import KitchenStats from '../components/kitchen/KitchenStats';
import KitchenOrderBoard from '../components/kitchen/KitchenOrderBoard';
import KitchenLoginModal from '../components/kitchen/KitchenLoginModal';
import Button from '../components/ui/Button';

export default function KitchenDisplay() {
  const { staffUser, isAuthenticated, isKitchenAuthorized, role, login, logout } = useStaffAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Hook into active kitchen orders when authorized
  const {
    orders,
    placedOrders,
    preparingOrders,
    loading,
    error,
    connectionStatus,
    lastPolledAt,
    soundEnabled,
    processingOrderIds,
    toggleSound,
    startPreparing,
    markReady,
    refreshQueue,
  } = useKitchenOrders(staffUser?.restaurantId, isAuthenticated && isKitchenAuthorized);

  // Calculate oldest wait time in minutes
  const oldestWaitMinutes = useMemo(() => {
    if (orders.length === 0) return 0;
    const oldestOrder = orders.reduce((oldest, current) => {
      const oldTime = new Date(oldest.createdAt || 0).getTime();
      const currTime = new Date(current.createdAt || 0).getTime();
      return currTime < oldTime ? current : oldest;
    }, orders[0]);

    if (!oldestOrder?.createdAt) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(oldestOrder.createdAt).getTime()) / 60000));
  }, [orders]);

  // Unauthenticated State
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--gds-radius-2xl, 16px)',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(217, 119, 6, 0.12)',
              color: '#d97706',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '1px solid rgba(217, 119, 6, 0.3)',
            }}
          >
            🍳
          </div>
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              marginBottom: '10px',
              letterSpacing: '-0.02em',
            }}
          >
            Kitchen Display Restricted
          </h1>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
              marginBottom: '28px',
            }}
          >
            Real-time live order streaming and kitchen preparation workflow require authenticated chef or kitchen staff credentials.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setLoginModalOpen(true)}
            style={{
              width: '100%',
              minHeight: '48px',
              fontSize: '1rem',
              fontWeight: 700,
            }}
          >
            Sign In as Kitchen Staff
          </Button>

          <KitchenLoginModal
            isOpen={loginModalOpen}
            onClose={() => setLoginModalOpen(false)}
            onLoginSuccess={login}
          />
        </div>
      </div>
    );
  }

  // Unauthorized Role State
  if (!isKitchenAuthorized) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--gds-radius-2xl, 16px)',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            🛑
          </div>
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              marginBottom: '10px',
              letterSpacing: '-0.02em',
            }}
          >
            Access Denied
          </h1>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
              marginBottom: '28px',
            }}
          >
            Your current staff role (<strong>{role}</strong>) does not have permission to manage the Kitchen Display System. Please sign in with a <strong>KITCHEN</strong> or <strong>ADMIN</strong> account.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="secondary" onClick={logout} style={{ flex: 1 }}>
              Sign Out
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                logout();
                setLoginModalOpen(true);
              }}
              style={{ flex: 1 }}
            >
              Switch Account
            </Button>
          </div>

          <KitchenLoginModal
            isOpen={loginModalOpen}
            onClose={() => setLoginModalOpen(false)}
            onLoginSuccess={login}
          />
        </div>
      </div>
    );
  }

  // Authorized Kitchen Operational Interface
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Operational Header */}
      <KitchenHeader
        restaurantName={staffUser.restaurantName}
        operatorName={staffUser.fullName || staffUser.username}
        operatorRole={staffUser.role}
        connectionStatus={connectionStatus}
        lastPolledAt={lastPolledAt}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onRefresh={refreshQueue}
        onLogout={logout}
      />

      {/* Main Operational Container */}
      <main
        style={{
          maxWidth: '1600px',
          width: '100%',
          margin: '0 auto',
          padding: '20px 24px 40px',
          boxSizing: 'border-box',
          flex: '1 1 auto',
        }}
      >
        {/* Error Notification Bar (if any backend or network issue occurs) */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--gds-radius-xl, 12px)',
              padding: '12px 16px',
              color: '#ef4444',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <span>⚠️ {error}</span>
            <Button variant="secondary" size="sm" onClick={refreshQueue}>
              Retry Sync
            </Button>
          </div>
        )}

        {/* Operational Metric Tiles */}
        <KitchenStats
          totalCount={orders.length}
          placedCount={placedOrders.length}
          preparingCount={preparingOrders.length}
          oldestWaitMinutes={oldestWaitMinutes}
        />

        {/* Live Kanban Ticket Board */}
        <KitchenOrderBoard
          placedOrders={placedOrders}
          preparingOrders={preparingOrders}
          onStartPreparing={startPreparing}
          onMarkReady={markReady}
          processingOrderIds={processingOrderIds}
        />
      </main>

      {/* CSS adjustments for mobile responsive view */}
      <style>{`
        @media (max-width: 768px) {
          .kds-mobile-tabs {
            display: block !important;
          }
          .kds-board-grid {
            grid-template-columns: 1fr !important;
          }
          .kds-hide-on-mobile {
            display: none !important;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
