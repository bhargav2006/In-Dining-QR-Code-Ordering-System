import React from 'react';
import { Clock, CheckCircle2, BellRing, Check, Ban } from 'lucide-react';

export function DietaryBadge({ vegetarian, spicy, className = '' }) {
  if (vegetarian === undefined && !spicy) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {vegetarian !== undefined && (
        <span
          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border"
          style={
            vegetarian
              ? {
                  backgroundColor: 'var(--color-success-bg)',
                  color: 'var(--color-success)',
                  borderColor: 'var(--color-success-border)',
                }
              : {
                  backgroundColor: 'var(--color-error-bg)',
                  color: 'var(--color-error)',
                  borderColor: 'var(--color-error-border)',
                }
          }
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ backgroundColor: vegetarian ? 'var(--color-success)' : 'var(--color-error)' }}
          />
          {vegetarian ? 'Veg' : 'Non-Veg'}
        </span>
      )}

      {spicy && (
        <span
          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border"
          style={{
            backgroundColor: 'var(--color-warning-bg)',
            color: 'var(--color-warning)',
            borderColor: 'var(--color-warning-border)',
          }}
          title="Spicy dish"
        >
          🌶️ Spicy
        </span>
      )}
    </div>
  );
}

export function OrderStatusBadge({ status, className = '' }) {
  const configs = {
    PLACED: {
      label: 'Order Placed',
      icon: Clock,
      style: {
        backgroundColor: 'var(--color-info-bg)',
        color: 'var(--color-info)',
        borderColor: 'var(--color-info-border)',
      },
    },
    PREPARING: {
      label: 'Kitchen Cooking',
      icon: Clock,
      style: {
        backgroundColor: 'var(--color-warning-bg)',
        color: 'var(--color-warning)',
        borderColor: 'var(--color-warning-border)',
      },
    },
    READY: {
      label: 'Ready to Serve',
      icon: BellRing,
      style: {
        backgroundColor: 'var(--color-primary-container)',
        color: 'var(--color-on-primary-container)',
        borderColor: 'var(--color-border)',
      },
    },
    SERVED: {
      label: 'Served to Table',
      icon: Check,
      style: {
        backgroundColor: 'var(--color-success-bg)',
        color: 'var(--color-success)',
        borderColor: 'var(--color-success-border)',
      },
    },
    COMPLETED: {
      label: 'Completed',
      icon: CheckCircle2,
      style: {
        backgroundColor: 'var(--color-surface-sunken)',
        color: 'var(--color-text-muted)',
        borderColor: 'var(--color-border)',
      },
    },
    CANCELLED: {
      label: 'Cancelled',
      icon: Ban,
      style: {
        backgroundColor: 'var(--color-error-bg)',
        color: 'var(--color-error)',
        borderColor: 'var(--color-error-border)',
      },
    },
  };

  const config = configs[status] || configs.PLACED;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${className}`}
      style={config.style}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}

