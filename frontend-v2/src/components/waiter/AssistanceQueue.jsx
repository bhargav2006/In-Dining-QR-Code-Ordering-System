import React from 'react';
import AssistanceRequestCard from './AssistanceRequestCard';

export default function AssistanceQueue({
  requests = [],
  onResolve,
  processingActionIds = new Set(),
}) {
  if (requests.length === 0) {
    return (
      <div
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          background: 'var(--color-surface)',
          border: '1px dashed var(--color-border)',
          borderRadius: 'var(--radius-lg, 12px)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🔔</div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--color-text)' }}>
          No Pending Assistance Calls
        </h3>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          All customer assistance calls have been resolved. When guests request water, waiter help, or the bill, requests will appear here instantly.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
          Customer Calls ({requests.length} Pending)
        </h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          Attend to guests promptly
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {requests.map((req) => (
          <AssistanceRequestCard
            key={req.id}
            request={req}
            onResolve={onResolve}
            isProcessing={processingActionIds.has(`assist-resolve-${req.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

