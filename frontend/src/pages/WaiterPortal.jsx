import React, { useState, useEffect } from 'react';
import { ConciergeBell, CheckCircle2, AlertTriangle, CreditCard, RefreshCw, UserCheck, DollarSign, X, Utensils, PhoneCall, ShoppingBag, Store, ShieldAlert } from 'lucide-react';
import { waiterApi } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function WaiterPortal({ user, onOpenLogin }) {
  const { toast } = useToast();
  const currentUser = user || (() => {
    try {
      const saved = localStorage.getItem('staffUser');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })();

  const [tables, setTables] = useState([]);
  const [assistanceList, setAssistanceList] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [selectedTableForCheckout, setSelectedTableForCheckout] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadData = async () => {
    if (!currentUser) return;
    try {
      const [tblData, astData, readyData] = await Promise.all([
        waiterApi.getTables(),
        waiterApi.getAssistanceRequests(),
        waiterApi.getReadyOrders(),
      ]);

      setTables(tblData || []);
      setAssistanceList(astData || []);
      setReadyOrders(readyData || []);
    } catch (err) {
      console.error('Error loading waiter portal data:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && (currentUser.role === 'WAITER' || currentUser.role === 'ADMIN')) {
      loadData();
      const pollMs = Number(import.meta.env.VITE_POLLING_INTERVAL_MS) || 4000;
      const interval = setInterval(loadData, pollMs);
      return () => clearInterval(interval);
    } else {
      setInitialLoading(false);
    }
  }, [currentUser]);

  const handleResolveAssistance = async (id) => {
    try {
      await waiterApi.resolveAssistance(id);
      loadData();
      toast.success('Assistance request resolved');
    } catch (err) {
      toast.error('Failed to resolve request: ' + err.message);
    }
  };

  const handleMarkServed = async (orderId) => {
    try {
      await waiterApi.markServed(orderId);
      loadData();
      toast.success('Order marked as served to table');
    } catch (err) {
      toast.error('Failed to mark order as served: ' + err.message);
    }
  };

  const handleStatusChange = async (tableId, newStatus) => {
    try {
      await waiterApi.updateTableStatus(tableId, newStatus);
      loadData();
      toast.info('Table status updated to ' + newStatus);
    } catch (err) {
      toast.error('Failed to update table status: ' + err.message);
    }
  };

  const handleCheckoutConfirm = async () => {
    if (!selectedTableForCheckout) return;
    try {
      await waiterApi.checkoutTable(selectedTableForCheckout.id);
      setSelectedTableForCheckout(null);
      loadData();
      toast.success('Table checkout completed successfully');
    } catch (err) {
      toast.error('Checkout failed: ' + err.message);
    }
  };

  const handleLiberateTable = async (tableId) => {
    try {
      await waiterApi.checkoutTable(tableId);
      loadData();
      toast.success('Table liberated and set to AVAILABLE');
    } catch (err) {
      toast.error('Failed to make table free: ' + err.message);
    }
  };

  if (!currentUser) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '1rem' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            padding: '1.2rem',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24',
            borderRadius: '20px',
            marginBottom: '1.2rem',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <ConciergeBell size={48} />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.6rem' }}>
            Waiter Operations Restricted
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Table occupancy monitoring, customer assistance calls, and ready food dispatch require authenticated waiter or floor staff access.
          </p>

          <button
            onClick={onOpenLogin}
            className="btn-primary"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
          >
            Sign In as Waiter Staff
          </button>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'WAITER' && currentUser.role !== 'ADMIN') {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '1rem' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            padding: '1.2rem',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            borderRadius: '20px',
            marginBottom: '1.2rem',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <ShieldAlert size={48} />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.6rem' }}>
            Waiter Operations Permission Denied
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Your current staff role (<strong>{currentUser.role}</strong>) does not have access to the Waiter Portal. Please sign in with a Waiter or Admin account.
          </p>

          <button
            onClick={onOpenLogin}
            className="btn-primary"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
          >
            Switch to Waiter Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem 6rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24',
            padding: '0.75rem',
            borderRadius: '14px',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <ConciergeBell size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>Waiter & Staff Operations</h1>
              {currentUser?.restaurantName && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(249, 115, 22, 0.15)',
                  border: '1px solid rgba(249, 115, 22, 0.35)',
                  color: '#fb923c',
                  fontSize: '0.8rem',
                  fontWeight: '700'
                }}>
                  <Store size={13} /> {currentUser.restaurantName}
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.2rem' }}>
              Food pick-up dispatch, cash collection & table map
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {!currentUser && onOpenLogin && (
            <button onClick={onOpenLogin} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Login to Switch Restaurant
            </button>
          )}
          <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <PhoneCall size={14} /> Waiter Hotline: +1 (555) 019-WAIT
          </span>
          <button onClick={loadData} className="btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* SECTION 1: Kitchen Pick-Up Notification Cards */}
      {readyOrders.length > 0 && (
        <div className="glass-panel" style={{
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '2px solid rgba(16, 185, 129, 0.5)',
          background: 'rgba(16, 185, 129, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#10b981', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1rem' }}>
            <Utensils size={24} />
            <span>🔔 Ready to Serve! Pick up from Kitchen ({readyOrders.length})</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
            {readyOrders.map(order => (
              <div key={order.orderId} style={{
                background: 'var(--bg-card)',
                padding: '1rem 1.2rem',
                borderRadius: '12px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.8rem'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                      color: '#fff',
                      fontWeight: 800,
                      padding: '0.3rem 0.7rem',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}>
                      Table #{order.tableNumber}
                    </span>
                    <span className="badge badge-ready">{order.orderNumber}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {order.items?.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-heading)', fontWeight: 600 }}>
                        <span>{it.dishName}</span>
                        <span style={{ color: '#10b981' }}>x{it.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleMarkServed(order.orderId)}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <CheckCircle2 size={16} /> Grab & Serve to Table #{order.tableNumber}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Pending Assistance & Cash Requests */}
      {assistanceList.length > 0 && (
        <div className="glass-panel pulse-alert" style={{
          padding: '1.2rem 1.5rem',
          marginBottom: '2rem',
          border: '1px solid rgba(245, 158, 11, 0.5)',
          background: 'rgba(245, 158, 11, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fbbf24', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.8rem' }}>
            <AlertTriangle size={22} />
            <span>Active Customer Assistance Calls ({assistanceList.length})</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {assistanceList.map(req => {
              const isCash = req.note && req.note.includes('CASH');

              return (
                <div key={req.id} style={{
                  background: isCash ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-card)',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: isCash ? '2px solid #f59e0b' : '1px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: '1.1rem' }}>Table #{req.tableNumber}</span>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700, marginTop: '0.2rem' }}>
                      {isCash ? '💰 CASH PAYMENT COLLECTION' : `Type: ${req.requestType}`}
                    </span>
                    {req.note && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>"{req.note}"</span>}
                  </div>

                  <button
                    onClick={() => handleResolveAssistance(req.id)}
                    className="btn-primary"
                    style={{ padding: '0.55rem 0.9rem', fontSize: '0.8rem', background: isCash ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : undefined }}
                  >
                    <CheckCircle2 size={14} /> {isCash ? 'Collect Cash & Finish Bill' : 'Attended'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: Dining Floor Layout & Table Map */}
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '1rem' }}>
        Dining Floor Layout & Table Map {currentUser?.restaurantName ? `(${currentUser.restaurantName})` : ''}
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1.5rem'
      }}>
        {tables.map(tbl => (
          <div key={tbl.id} className="glass-panel" style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
            border: tbl.status === 'BILL_REQUESTED' 
              ? '2px solid #f59e0b' 
              : (tbl.status === 'OCCUPIED' ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid var(--border-glass)')
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)' }}>Table #{tbl.tableNumber}</span>
                <span className={`badge badge-${tbl.status?.toLowerCase()}`}>
                  {tbl.status}
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <span>Capacity: {tbl.capacity} Seats</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>QR: {tbl.qrToken}</span>
                {tbl.activeSessionToken && (
                  <div style={{
                    marginTop: '0.4rem',
                    padding: '0.5rem 0.7rem',
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: '8px',
                    color: '#38bdf8',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.4rem'
                  }}>
                    <div>
                      <span>🔑 Session Code: </span>
                      <code style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#fff', fontWeight: 800 }}>{tbl.activeSessionToken}</code>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(tbl.activeSessionToken);
                        toast.success(`Session Code ${tbl.activeSessionToken} copied for Table #${tbl.tableNumber}!`);
                      }}
                      className="btn-secondary"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                    >
                      📋 Copy
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Actions depending on status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {tbl.status === 'AVAILABLE' && (
                <button
                  onClick={() => handleStatusChange(tbl.id, 'OCCUPIED')}
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
                >
                  Mark Occupied
                </button>
              )}

              {(tbl.status === 'OCCUPIED' || tbl.status === 'BILL_REQUESTED') && (
                <button
                  onClick={() => setSelectedTableForCheckout(tbl)}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
                >
                  <CreditCard size={16} /> Bill & Checkout Table
                </button>
              )}

              {tbl.status === 'CLEANING_NEEDED' && (
                <button
                  onClick={() => handleStatusChange(tbl.id, 'AVAILABLE')}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <CheckCircle2 size={16} /> Table Cleaned & Ready
                </button>
              )}

              {tbl.status !== 'AVAILABLE' && (
                <button
                  onClick={() => handleLiberateTable(tbl.id)}
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', borderColor: '#10b981', color: '#10b981', fontSize: '0.85rem' }}
                >
                  <CheckCircle2 size={16} /> Make Table Free (AVAILABLE)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Modal */}
      {selectedTableForCheckout && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '450px', width: '100%', padding: '1.8rem', position: 'relative' }}>
            <button onClick={() => setSelectedTableForCheckout(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem' }}>
              Table #{selectedTableForCheckout.tableNumber} Settlement
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
              Confirm payment receipt and liberate table session.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                <span>Table Status:</span>
                <span className={`badge badge-${selectedTableForCheckout.status?.toLowerCase()}`}>{selectedTableForCheckout.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                <span>Assigned Waiter Mobile:</span>
                <span style={{ color: '#10b981' }}>+1 (555) 019-WAIT</span>
              </div>
            </div>

            <button onClick={handleCheckoutConfirm} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1rem' }}>
              <DollarSign size={18} /> Confirm Cash / Settlement & Reset Table
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
