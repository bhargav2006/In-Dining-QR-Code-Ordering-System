import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartFloatingBar({
  itemCount = 0,
  subtotal = 0,
  onOpenCart,
}) {
  if (itemCount <= 0) return null;

  const formattedSubtotal = Number(subtotal || 0).toFixed(2);

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 animate-in slide-in-from-bottom-4 duration-300"
    >
      <button
        type="button"
        onClick={onOpenCart}
        className="w-full p-3.5 rounded-2xl shadow-xl border flex items-center justify-between gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          borderColor: 'transparent',
        }}
        aria-label="View and submit order"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.20)',
            }}
          >
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium opacity-90 leading-none">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in order
            </span>
            <span className="text-sm font-bold tracking-tight">
              ₹{formattedSubtotal}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
          <span>Review Order</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
}

