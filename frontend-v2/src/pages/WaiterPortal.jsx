import React, { useState } from 'react';
import { useStaffAuth } from '../context/StaffAuthContext';
import { useWaiterData } from '../hooks/useWaiterData';
import WaiterHeader from '../components/waiter/WaiterHeader';
import WaiterStats from '../components/waiter/WaiterStats';
import TableFloorGrid from '../components/waiter/TableFloorGrid';
import ReadyOrdersQueue from '../components/waiter/ReadyOrdersQueue';
import AssistanceQueue from '../components/waiter/AssistanceQueue';
import CheckoutModal from '../components/waiter/CheckoutModal';
import WaiterLoginModal from '../components/waiter/WaiterLoginModal';
import Button from '../components/ui/Button';

export default function WaiterPortal() {
  const { staffUser, isAuthenticated, isWaiterAuthorized, role, login, logout } = useStaffAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('floor'); // 'floor' | 'ready' | 'assistance'
  const [checkoutTargetTable, setCheckoutTargetTable] = useState(null);

  // Hook into live waiter floor data when authorized
  const {
    tables,
    readyOrders,
    assistanceRequests,
    stats,
    loading,
    error,
    connectionStatus,
    lastPolledAt,
    soundEnabled,
    processingActionIds,
    toggleSound,
    updateTableStatus,
    markOrderServed,
    resolveAssistance,
    checkoutTable,
    refreshFloor,
  } = useWaiterData(isAuthenticated && isWaiterAuthorized);

  // 1. Unauthenticated State
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
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--color-primary, #10b981)',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            👔
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
            Floor Portal Restricted
          </h1>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
              marginBottom: '28px',
            }}
          >
            This portal is reserved for dining room floor staff and administrators to manage tables, receive kitchen-ready food, and respond to guest requests.
          </p>

          <Button
            variant="primary"
            size="lg"
            style={{ width: '100%', marginBottom: '12px' }}
            onClick={() => setLoginModalOpen(true)}
          >
            Sign In with Staff Account
          </Button>

          <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Preset: <code style={{ color: 'var(--color-primary, #10b981)' }}>waiter / waiter123</code>
          </div>
        </div>

        <WaiterLoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={login}
        />
      </div>
    );
  }

  // 2. Unauthorized Role State (e.g. logged in as ROLE_KITCHEN)
  if (!isWaiterAuthorized) {
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
            🚫
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
              lineHeight: 1.5,
              marginBottom: '20px',
            }}
          >
            You are signed in as <strong>{staffUser?.username}</strong> with role{' '}
            <code style={{ color: '#ef4444' }}>{role}</code>.
            <br />
            This station requires <strong>ROLE_WAITER</strong> or <strong>ROLE_ADMIN</strong> privileges.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button variant="outline" size="md" onClick={logout}>
              Sign Out
            </Button>
            <Button variant="primary" size="md" onClick={() => setLoginModalOpen(true)}>
              Switch Account
            </Button>
          </div>
        </div>

        <WaiterLoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={login}
        />
      </div>
    );
  }

  // 3. Authorized Waiter Floor Operations Dashboard
  const operatorName = staffUser?.username === 'waiter' ? 'Lead Waiter' : staffUser?.username;

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
      {/* Station Header */}
      <WaiterHeader
        restaurantName="Tasty Tacos"
        operatorName={operatorName}
        operatorRole={role}
        connectionStatus={connectionStatus}
        lastPolledAt={lastPolledAt}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onRefresh={refreshFloor}
        onLogout={logout}
        onOpenLogin={() => setLoginModalOpen(true)}
      />

      {/* Main Operational Container */}
      <main
        style={{
          flex: 1,
          maxWidth: '1600px',
          width: '100%',
          margin: '0 auto',
          padding: '20px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Error notification banner if polling encountered an issue */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md, 8px)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>⚠️ {error}</span>
            <Button variant="outline" size="sm" onClick={refreshFloor} style={{ color: '#ef4444', borderColor: '#ef4444' }}>
              Retry
            </Button>
          </div>
        )}

        {/* Operational KPI Tiles */}
        <WaiterStats
          stats={stats}
          activeTab={activeTab}
          onSelectTab={(tabId) => {
            if (tabId === 'ready' || tabId === 'assistance') {
              setActiveTab(tabId);
            } else {
              setActiveTab('floor');
            }
          }}
        />

        {/* Main Section Navigation Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '8px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('floor')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md, 8px)',
                border: 'none',
                background: activeTab === 'floor' ? 'var(--color-surface-sunken)' : 'transparent',
                color: activeTab === 'floor' ? 'var(--color-primary, #10b981)' : 'var(--color-text-muted)',
                fontWeight: activeTab === 'floor' ? 800 : 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                borderBottom: activeTab === 'floor' ? '2px solid var(--color-primary, #10b981)' : '2px solid transparent',
              }}
            >
              <span>🪑 Floor Tables</span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 'var(--gds-radius-full, 9999px)',
                  background: activeTab === 'floor' ? 'var(--color-primary, #10b981)' : 'var(--color-surface-sunken)',
                  color: activeTab === 'floor' ? '#ffffff' : 'var(--color-text-muted)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--gds-font-mono, monospace)',
                }}
              >
                {tables.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ready')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md, 8px)',
                border: 'none',
                background: activeTab === 'ready' ? 'var(--color-surface-sunken)' : 'transparent',
                color: activeTab === 'ready' ? '#3b82f6' : 'var(--color-text-muted)',
                fontWeight: activeTab === 'ready' ? 800 : 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                borderBottom: activeTab === 'ready' ? '2px solid #3b82f6' : '2px solid transparent',
              }}
            >
              <span>🍽️ Ready Food</span>
              {readyOrders.length > 0 && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--gds-radius-full, 9999px)',
                    background: '#3b82f6',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--gds-font-mono, monospace)',
                    animation: 'pulse 1.5s infinite',
                  }}
                >
                  {readyOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('assistance')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md, 8px)',
                border: 'none',
                background: activeTab === 'assistance' ? 'var(--color-surface-sunken)' : 'transparent',
                color: activeTab === 'assistance' ? '#f59e0b' : 'var(--color-text-muted)',
                fontWeight: activeTab === 'assistance' ? 800 : 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                borderBottom: activeTab === 'assistance' ? '2px solid #f59e0b' : '2px solid transparent',
              }}
            >
              <span>🔔 Assistance</span>
              {assistanceRequests.length > 0 && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--gds-radius-full, 9999px)',
                    background: '#f59e0b',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--gds-font-mono, monospace)',
                    animation: 'pulse 1.5s infinite',
                  }}
                >
                  {assistanceRequests.length}
                </span>
              )}
            </button>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            10s Auto-sync active
          </span>
        </div>

        {/* Tab Content Panels */}
        {activeTab === 'floor' && (
          <TableFloorGrid
            tables={tables}
            onStatusChange={updateTableStatus}
            onInitiateCheckout={(tbl) => setCheckoutTargetTable(tbl)}
            onViewReadyOrders={(tblNum) => {
              setActiveTab('ready');
            }}
            onViewAssistance={(tblNum) => {
              setActiveTab('assistance');
            }}
            processingActionIds={processingActionIds}
          />
        )}

        {activeTab === 'ready' && (
          <ReadyOrdersQueue
            orders={readyOrders}
            onMarkServed={markOrderServed}
            processingActionIds={processingActionIds}
          />
        )}

        {activeTab === 'assistance' && (
          <AssistanceQueue
            requests={assistanceRequests}
            onResolve={resolveAssistance}
            processingActionIds={processingActionIds}
          />
        )}
      </main>

      {/* Checkout & Liberate Modal */}
      <CheckoutModal
        isOpen={Boolean(checkoutTargetTable)}
        table={checkoutTargetTable}
        onClose={() => setCheckoutTargetTable(null)}
        onConfirmCheckout={async (tableId) => {
          await checkoutTable(tableId);
          setCheckoutTargetTable(null);
        }}
        isProcessing={
          checkoutTargetTable ? processingActionIds.has(`table-checkout-${checkoutTargetTable.id}`) : false
        }
      />

      {/* Staff Switch / Login Modal */}
      <WaiterLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={login}
      />
    </div>
  );
}

