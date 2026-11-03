import React from 'react';
import CircularLogo from '../ui/CircularLogo';
import ThemeToggle from '../ui/ThemeToggle';
import { BellRing, ClipboardList } from 'lucide-react';

export default function CustomerHeader({
  restaurantName = 'Gourmet Bistro',
  tableNumber,
  activeOrdersCount = 0,
  onOpenAssistance,
  onOpenOrders,
}) {
  return (
    <header
      className="sticky top-0 z-40 w-full border-b backdrop-blur-md px-4 sm:px-6 py-3 transition-colors duration-200"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'rgba(var(--color-bg-rgb), 0.90)',
      }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand identity & Table info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <CircularLogo size="sm" showGlow />
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight truncate leading-tight">
              {restaurantName}
            </h1>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {tableNumber ? (
                <span
                  className="inline-flex items-center font-mono font-semibold px-1.5 py-0.2 rounded border"
                  style={{
                    backgroundColor: 'var(--color-primary-container)',
                    color: 'var(--color-on-primary-container)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  Table #{tableNumber}
                </span>
              ) : (
                <span>Dine-In Menu</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Call Waiter Button */}
          <button
            type="button"
            onClick={onOpenAssistance}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
            aria-label="Call Waiter"
            title="Call Waiter for Assistance"
          >
            <BellRing className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Call Waiter</span>
          </button>

          {/* Orders Tracking Pill */}
          <button
            type="button"
            onClick={onOpenOrders}
            className="relative inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
            aria-label="View Active Orders"
            title="View Active Orders"
          >
            <ClipboardList className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">My Orders</span>
            {activeOrdersCount > 0 && (
              <span
                className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {activeOrdersCount}
              </span>
            )}
          </button>

          {/* Theme switcher */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

