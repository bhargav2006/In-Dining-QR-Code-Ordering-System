import React, { useState, useEffect } from 'react';
import { CookingPot, Clock, CheckCircle, Flame, AlertCircle, RefreshCw } from 'lucide-react';
import { kitchenApi } from '../services/api';

export default function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchKitchenOrders = async () => {
    try {
      const data = await kitchenApi.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();
    const pollMs = Number(import.meta.env.VITE_POLLING_INTERVAL_MS) || 4000;
    const interval = setInterval(fetchKitchenOrders, pollMs);
    return () => clearInterval(interval);
  }, []);

  const handleStatusAdvance = async (orderId, currentStatus) => {
    let nextStatus = 'PREPARING';
    if (currentStatus === 'PLACED') nextStatus = 'PREPARING';
    else if (currentStatus === 'PREPARING') nextStatus = 'READY';
    else if (currentStatus === 'READY') nextStatus = 'SERVED';

    try {
      await kitchenApi.updateStatus(orderId, nextStatus);
      fetchKitchenOrders();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const getElapsedMinutes = (dateStr) => {
    if (!dateStr) return 0;
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / 60000);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
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
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Kitchen Display System (KDS)</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Real-time cooking queue & status workflow</p>
          </div>
        </div>

        <button onClick={fetchKitchenOrders} className="btn-secondary">
          <RefreshCw size={16} /> Refresh Queue
        </button>
      </div>

      {/* Kanban Grid */}
      {orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>Kitchen Queue Clear!</h3>
          <p style={{ marginTop: '0.4rem' }}>No active orders waiting for preparation.</p>
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
                      <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
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
                    background: isLate ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
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
                        background: 'rgba(255, 255, 255, 0.04)',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        borderLeft: '3px solid #10b981'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
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
                    justify: 'center',
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
