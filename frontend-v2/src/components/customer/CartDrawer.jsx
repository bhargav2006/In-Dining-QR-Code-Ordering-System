import React, { useState } from 'react';
import Drawer from '../ui/Drawer';
import Button from '../ui/Button';
import { Plus, Minus, Trash2, Utensils, Send, MessageSquare } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  items = [],
  subtotal = 0,
  taxEstimate = 0,
  totalEstimate = 0,
  orderNotes = '',
  onSetOrderNotes,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSubmitOrder,
  isSubmitting = false,
  tableNumber,
}) {
  const [notesExpanded, setNotesExpanded] = useState(false);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Table Order Review"
      subtitle={tableNumber ? `Table #${tableNumber} • Review before sending to kitchen` : 'Review items'}
      footer={
        items.length > 0 ? (
          <div className="flex flex-col gap-3">
            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between" style={{ color: 'var(--color-text-muted)' }}>
                <span>Subtotal</span>
                <span className="font-mono">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between" style={{ color: 'var(--color-text-muted)' }}>
                <span>Estimated Tax (5%)</span>
                <span className="font-mono">₹{taxEstimate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1.5 border-t" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                <span>Order Total</span>
                <span className="font-mono text-base">₹{totalEstimate.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="md"
                onClick={onClearCart}
                disabled={isSubmitting}
                className="shrink-0"
                aria-label="Clear all cart items"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={onSubmitOrder}
                loading={isSubmitting}
                className="flex-1"
                icon={Send}
              >
                Send Order to Kitchen • ₹{totalEstimate.toFixed(2)}
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div
            className="w-12 h-12 rounded-full border flex items-center justify-center mb-3"
            style={{
              backgroundColor: 'var(--color-surface-sunken)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            <Utensils className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold mb-1">Your order is empty</h4>
          <p className="text-xs max-w-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Explore our curated menu and add dishes you'd like the kitchen to prepare.
          </p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Back to Menu
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Cart Item Cards */}
          {items.map((item, idx) => {
            const itemTotal = (item.unitPrice * item.quantity).toFixed(2);

            return (
              <div
                key={`${item.dishId}-${idx}`}
                className="p-3 rounded-xl border flex items-start justify-between gap-3 transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface-sunken)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold truncate">
                    {item.dish?.name}
                  </h4>
                  <div className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    ₹{item.unitPrice.toFixed(2)} each
                  </div>

                  {item.specialInstructions && (
                    <div
                      className="text-[11px] italic mt-1.5 p-1.5 rounded-lg border leading-tight"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      Note: "{item.specialInstructions}"
                    </div>
                  )}
                </div>

                {/* Right Column: Quantity Controls & Subtotal */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-xs sm:text-sm font-bold font-mono">
                    ₹{itemTotal}
                  </span>

                  <div
                    className="inline-flex items-center rounded-lg border p-0.5 shadow-xs"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center rounded hover:opacity-75 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold font-mono">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center rounded hover:opacity-75 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Kitchen Order Notes Collapsible */}
          <div className="pt-2">
            {!notesExpanded ? (
              <button
                type="button"
                onClick={() => setNotesExpanded(true)}
                className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{orderNotes ? 'Edit overall order notes' : '+ Add special note for kitchen'}</span>
              </button>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="kitchen-order-notes"
                  className="text-xs font-semibold flex items-center justify-between"
                >
                  <span>Overall Kitchen Instructions</span>
                  <button
                    type="button"
                    onClick={() => setNotesExpanded(false)}
                    className="text-[11px] hover:underline"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Done
                  </button>
                </label>
                <textarea
                  id="kitchen-order-notes"
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => onSetOrderNotes(e.target.value)}
                  placeholder="e.g., serve appetizers first, celebrate anniversary..."
                  className="w-full p-2.5 rounded-xl text-xs border transition-all focus:outline-none resize-none"
                  style={{
                    backgroundColor: 'var(--color-surface-sunken)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                  maxLength={250}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}

