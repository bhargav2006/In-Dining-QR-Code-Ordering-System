import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext({
  showToast: () => {},
  toast: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toastObj = Object.assign(showToast, {
    success: (msg, dur) => showToast(msg, 'success', dur),
    error: (msg, dur) => showToast(msg, 'error', dur),
    info: (msg, dur) => showToast(msg, 'info', dur),
  });

  return (
    <ToastContext.Provider value={{ showToast, toast: toastObj }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-2"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
            style={{
              backgroundColor: 'var(--color-surface-raised)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            {item.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
            )}
            {item.type === 'error' && (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            )}
            {item.type === 'info' && (
              <Info className="w-5 h-5 shrink-0 text-sky-500 mt-0.5" />
            )}

            <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
              {item.message}
            </div>

            <button
              type="button"
              onClick={() => removeToast(item.id)}
              className="p-1 rounded hover:opacity-75 transition-opacity"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

