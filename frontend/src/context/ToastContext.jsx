import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    success: (msg, duration) => showToast(msg, 'success', duration),
    error: (msg, duration) => showToast(msg, 'error', duration),
    warning: (msg, duration) => showToast(msg, 'warning', duration),
    info: (msg, duration) => showToast(msg, 'info', duration),
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast, toast }}>
      {children}
      {/* Toast Render Container */}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          top: '1.25rem',
          right: '1.25rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          maxWidth: '420px',
          width: 'calc(100% - 2.5rem)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => {
          let icon = <Info size={18} style={{ color: '#3b82f6', flexShrink: 0 }} />;
          let borderLeft = '4px solid #3b82f6';

          if (t.type === 'success') {
            icon = <CheckCircle2 size={18} style={{ color: '#059669', flexShrink: 0 }} />;
            borderLeft = '4px solid #059669';
          } else if (t.type === 'error') {
            icon = <AlertCircle size={18} style={{ color: '#e11d48', flexShrink: 0 }} />;
            borderLeft = '4px solid #e11d48';
          } else if (t.type === 'warning') {
            icon = <AlertTriangle size={18} style={{ color: '#d97706', flexShrink: 0 }} />;
            borderLeft = '4px solid #d97706';
          }

          return (
            <div
              key={t.id}
              role="alert"
              className="animate-pop-in"
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderRadius: '0.625rem',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-glass)',
                borderLeft,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(16px)',
                fontSize: '0.88rem',
                lineHeight: 1.45,
                fontWeight: 500,
              }}
            >
              <div style={{ marginTop: '2px' }}>{icon}</div>
              <div style={{ flex: 1, wordBreak: 'break-word' }}>
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                aria-label="Close notification"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.7,
                  transition: 'opacity 0.2s',
                  marginLeft: '0.25rem',
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseOut={(e) => (e.currentTarget.style.opacity = '0.7')}
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
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
