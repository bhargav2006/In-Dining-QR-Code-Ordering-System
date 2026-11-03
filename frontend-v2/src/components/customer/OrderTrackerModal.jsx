import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { OrderStatusBadge } from '../ui/Badge';
import { RefreshCw, Receipt, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function OrderTrackerModal({
  isOpen,
  onClose,
  orders = [],
  isLoading = false,
  isCancelling = false,
  onCancelOrder,
  onRefresh,
  onOpenBill,
  tableNumber,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Table Orders & Status"
      subtitle={tableNumber ? `Table #${tableNumber} • Live Kitchen Progress` : 'Live Order Progress'}
      maxWidth="max-w-xl"
    >
      <div className="flex flex-col gap-4">
        {/* Polling & Refresh Bar */}
        <div
          className="flex items-center justify-between px-3 py-2 rounded-xl border text-xs"
          style={{
            backgroundColor: 'var(--color-surface-sunken)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full inline-block animate-pulse bg-emerald-500" />
            <span>Auto-refreshing every 12s</span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50"
            style={{ color: 'var(--color-primary)' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="py-12 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" style={{ color: 'var(--color-text-muted)' }} />
            <h4 className="text-sm font-bold mb-1">No orders placed yet</h4>
            <p className="text-xs max-w-xs mx-auto" style={{ color: 'var(--color-text-muted)' }}>
              Add items from the menu and submit your order to see live preparation progress here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const canCancel = order.status === 'PLACED';
              const isCancelled = order.status === 'CANCELLED';
              const createdDate = order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

              return (
                <div
                  key={order.orderId || order.id}
                  className="rounded-2xl border p-4 flex flex-col gap-3 transition-colors"
                  style={{
                    backgroundColor: 'var(--color-surface-sunken)',
                    borderColor: 'var(--color-border)',
                    opacity: isCancelled ? 0.65 : 1,
                  }}
                >
                  {/* Order Card Header */}
                  <div className="flex items-start justify-between gap-2 pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold tracking-tight">
                          #{order.orderNumber || `ORD-${order.orderId}`}
                        </span>
                        {createdDate && (
                          <span className="text-[11px]" style={{ color: 'var(--color-text-subtle)' }}>
                            {createdDate}
                          </span>
                        )}
                      </div>
                      {order.notes && (
                        <p className="text-[11px] italic mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          Kitchen Note: "{order.notes}"
                        </p>
                      )}
                    </div>

                    <OrderStatusBadge status={order.status} />
                  </div>

                  {/* Order Items Table */}
                  <div className="flex flex-col gap-1.5 text-xs">
                    {(order.items || []).map((item, idx) => (
                      <div key={item.id || idx} className="flex items-start justify-between gap-2">
                        <div className="flex items-baseline gap-1.5 min-w-0">
                          <span className="font-mono font-bold text-xs" style={{ color: 'var(--color-primary)' }}>
                            {item.quantity}×
                          </span>
                          <span className="font-medium truncate">
                            {item.dishName}
                          </span>
                          {item.specialInstructions && (
                            <span className="text-[10px] italic opacity-75 truncate">
                              ({item.specialInstructions})
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs font-semibold shrink-0">
                          ₹{(Number(item.itemTotal || (item.unitPrice * item.quantity))).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer & Actions */}
                  <div className="pt-2 border-t flex items-center justify-between gap-2 text-xs" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="font-bold">
                      Order Subtotal: <span className="font-mono font-bold">₹{Number(order.totalAmount || 0).toFixed(2)}</span>
                    </div>

                    {canCancel ? (
                      <Button
                        variant="danger"
                        size="xs"
                        loading={isCancelling}
                        onClick={() => onCancelOrder(order.orderId || order.id)}
                      >
                        Cancel Order
                      </Button>
                    ) : order.status === 'PREPARING' ? (
                      <span className="text-[11px] italic" style={{ color: 'var(--color-text-muted)' }}>
                        Cooking in kitchen (cannot cancel)
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {/* Bill Receipt CTA */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  onClose();
                  onOpenBill();
                }}
                className="w-full"
                icon={Receipt}
              >
                View Itemized Bill & Pay
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

