import React, { useState, useEffect } from 'react';
import { CookingPot, Clock, CheckCircle, Flame, AlertCircle, RefreshCw, Store, ShieldAlert } from 'lucide-react';
import { kitchenApi } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function KitchenDisplay({ user, onOpenLogin }) {
  const { toast } = useToast();
  const currentUser = user || (() => {
    try {
      const saved = localStorage.getItem('staffUser');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })();

  const [orders, setOrders] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchKitchenOrders = async () => {
    if (!currentUser) return;
    try {
      const data = await kitchenApi.getOrders();
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && (currentUser.role === 'KITCHEN' || currentUser.role === 'ADMIN')) {
      fetchKitchenOrders();
      const pollMs = Number(import.meta.env.VITE_POLLING_INTERVAL_MS) || 4000;
      const interval = setInterval(fetchKitchenOrders, pollMs);
      return () => clearInterval(interval);
    } else {
      setInitialLoading(false);
    }
  }, [currentUser]);

  const handleStatusAdvance = async (orderId, currentStatus) => {
    let nextStatus = 'PREPARING';
    if (currentStatus === 'PLACED') nextStatus = 'PREPARING';
    else if (currentStatus === 'PREPARING') nextStatus = 'READY';
    else if (currentStatus === 'READY') nextStatus = 'SERVED';

    try {
      await kitchenApi.updateStatus(orderId, nextStatus);
      fetchKitchenOrders();
      toast.success(`Order advanced to ${nextStatus}`);
    } catch (err) {
      toast.error('Failed to update status: ' + err.message);
    }
  };

  const getElapsedMinutes = (dateStr) => {
    if (!dateStr) return 0;
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / 60000);
  };

  if (!currentUser) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '1rem' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            padding: '1.2rem',
            background: 'rgba(6, 182, 212, 0.15)',
            color: '#38bdf8',
            borderRadius: '20px',
            marginBottom: '1.2rem',
            border: '1px solid rgba(6, 182, 212, 0.3)'
          }}>
            <CookingPot size={48} />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.6rem' }}>
            Kitchen Display Restricted
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Live order ticket streaming and cooking status workflow require authenticated kitchen staff or chef access.
          </p>

          <button
            onClick={onOpenLogin}
            className="btn-primary"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem', background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)' }}
          >
            Sign In as Kitchen Staff
          </button>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'KITCHEN' && currentUser.role !== 'ADMIN') {
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
            Kitchen Display Permission Denied
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Your current staff role (<strong>{currentUser.role}</strong>) does not have access to the Kitchen Display System. Please sign in with a Kitchen or Admin account.
          </p>

          <button
            onClick={onOpenLogin}
            className="btn-primary"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem', background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)' }}
          >
            Switch to Kitchen Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            background: 'rgba(6, 182, 212, 0.15)',
            color: '#38bdf8',
            padding: '0.75rem',
            borderRadius: '14px',
            border: '1px solid rgba(6, 182, 212, 0.3)'
          }}>
            <CookingPot size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>Kitchen Display System (KDS)</h1>
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
              Real-time cooking queue & status workflow
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!currentUser && onOpenLogin && (
            <button onClick={onOpenLogin} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Login to Switch Restaurant
            </button>
          )}
          <button onClick={fetchKitchenOrders} className="btn-secondary">
            <RefreshCw size={16} /> Refresh Queue
          </button>
        </div>
      </div>

      {/* Kanban Grid */}
      {orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', fontWeight: 700 }}>Kitchen Queue Clear!</h3>
          <p style={{ marginTop: '0.4rem' }}>
            No active orders waiting for preparation {currentUser?.restaurantName ? `for ${currentUser.restaurantName}` : ''}.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem'
        }}>
          {orders.map(order => {
            const elapsed = getElapsedMinutes(order.createdAt);
            const isLate = elapsed > 15;

            return (
              <div key={order.orderId} className="glass-panel" style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: order.status === 'PREPARING' ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid var(--border-glass)'
              }}>
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                        color: '#fff',
                        fontWeight: 800,
                        padding: '0.4rem 0.8rem',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}>
                        T-{order.tableNumber}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.95rem' }}>
                        {order.orderNumber}
                      </span>
                    </div>

                    <span className={`badge badge-${order.status?.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Timer Badge */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: isLate ? '#f87171' : 'var(--text-muted)',
                    background: isLate ? 'rgba(244, 63, 94, 0.15)' : 'var(--btn-secondary-bg)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    marginBottom: '1rem'
                  }}>
                    <Clock size={12} /> {elapsed} mins ago
                  </div>

                  {/* Order Items List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.2rem' }}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{
                        background: 'var(--btn-secondary-bg)',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        borderLeft: '3px solid #10b981'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.95rem' }}>
                          <span>{item.dishName}</span>
                          <span style={{ color: '#10b981' }}>x{item.quantity}</span>
                        </div>
                        {item.specialInstructions && (
                          <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Flame size={12} /> Note: {item.specialInstructions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Order Level Notes */}
                  {order.notes && (
                    <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginBottom: '1rem', fontStyle: 'italic' }}>
                      Table Note: "{order.notes}"
                    </div>
                  )}
                </div>

                {/* Status Transition Action Button */}
                <button
                  onClick={() => handleStatusAdvance(order.orderId, order.status)}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    background: order.status === 'PLACED' 
                      ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' 
                      : (order.status === 'PREPARING' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'linear-gradient(135deg, #10b981 0%, #047857 100%)')
                  }}
                >
                  {order.status === 'PLACED' && '🔥 Start Preparing'}
                  {order.status === 'PREPARING' && '✅ Mark Ready for Serve'}
                  {order.status === 'READY' && '🎉 Complete & Served'}
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
