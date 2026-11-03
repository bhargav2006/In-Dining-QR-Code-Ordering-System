import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxHeight = 'max-h-[85vh]',
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Window */}
      <div
        className={`relative w-full max-w-xl mx-auto rounded-t-3xl border-t border-x shadow-2xl flex flex-col ${maxHeight} z-10 animate-in slide-in-from-bottom duration-300`}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
        }}
      >
        {/* Grab Handle */}
        <div className="w-12 h-1.5 rounded-full mx-auto my-2 shrink-0 opacity-40" style={{ backgroundColor: 'var(--color-control-border)' }} />

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <h3 id="drawer-title" className="text-base font-bold tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity cursor-pointer"
            style={{
              backgroundColor: 'var(--color-surface-sunken)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
            aria-label="Close sheet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {/* Optional Action Footer */}
        {footer && (
          <div
            className="p-4 border-t shrink-0"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface-raised)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

