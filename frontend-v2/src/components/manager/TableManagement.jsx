import React, { useState } from 'react';
import Button from '../ui/Button';
import TableModal from './TableModal';
import TableQRModal from './TableQRModal';
import TableStatusBadge from '../waiter/TableStatusBadge';

export default function TableManagement({
  tables = [],
  restaurantName = 'Tasty Tacos',
  restaurantSlug = 'tasty-tacos',
  onSaveTable,
  onDeleteTable,
  onRegenerateQr,
  isProcessing = false,
  processingActionIds = new Set(),
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [regenerateConfirmId, setRegenerateConfirmId] = useState(null);

  const handleCreate = () => {
    setSelectedTable(null);
    setModalOpen(true);
  };

  const handleEdit = (table) => {
    setSelectedTable(table);
    setModalOpen(true);
  };

  const handleViewQr = (table) => {
    setSelectedTable(table);
    setQrModalOpen(true);
  };

  const handleDelete = async (id) => {
    await onDeleteTable(id);
    setDeleteConfirmId(null);
  };

  const handleRegenerate = async (id) => {
    await onRegenerateQr(id);
    setRegenerateConfirmId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--color-text)' }}>
            Dining Tables & QR Standees ({tables.length})
          </h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Configure dining tables, generate printable high-res QR codes, and regenerate tokens.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleCreate} disabled={isProcessing}>
          <span>+ Add Dining Table</span>
        </Button>
      </div>

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg, 12px)',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🪑</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--color-text)' }}>
            No Tables Configured
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Set up your first dining table to start accepting contactless QR orders.
          </p>
          <Button variant="primary" size="sm" onClick={handleCreate}>
            Add Dining Table
          </Button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {tables.map((tbl) => {
            const isRegenerating = processingActionIds.has(`table-qr-regen-${tbl.id}`);
            const isDeleting = processingActionIds.has(`table-delete-${tbl.id}`);
            const isConfirmingDelete = deleteConfirmId === tbl.id;
            const isConfirmingRegen = regenerateConfirmId === tbl.id;

            return (
              <div
                key={tbl.id}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg, 12px)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Header: Table Number & Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text)' }}>
                      Table {tbl.tableNumber}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      👥 {tbl.capacity} Seats
                    </span>
                  </div>
                  <TableStatusBadge status={tbl.status} size="sm" />
                </div>

                {/* Session & QR Token info */}
                <div
                  style={{
                    background: 'var(--color-surface-sunken)',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    fontSize: '0.725rem',
                    fontFamily: 'var(--gds-font-mono, monospace)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>SESSION:</span>
                    <span style={{ fontWeight: 600, color: tbl.activeSessionToken ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                      {tbl.activeSessionToken || 'No Active Session'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>QR TOKEN:</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary, #10b981)' }}>
                      {tbl.qrToken ? tbl.qrToken.slice(-12) : 'None'}
                    </span>
                  </div>
                </div>

                {/* QR Action Bar */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={() => handleViewQr(tbl)}
                  >
                    <span>📱 View & Print QR</span>
                  </Button>

                  {isConfirmingRegen ? (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={() => handleRegenerate(tbl.id)}
                        disabled={isRegenerating || isProcessing}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setRegenerateConfirmId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRegenerateConfirmId(tbl.id)}
                      disabled={isRegenerating || isProcessing}
                      title="Generate new QR token (invalidates old printed QR codes)"
                    >
                      🔄 Reset QR
                    </Button>
                  )}
                </div>

                {/* Edit & Delete row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    ID: #{tbl.id}
                  </span>

                  {isConfirmingDelete ? (
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={() => handleDelete(tbl.id)}
                        disabled={isDeleting || isProcessing}
                      >
                        Yes, Delete
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setDeleteConfirmId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleEdit(tbl)}
                        disabled={isProcessing}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        onClick={() => setDeleteConfirmId(tbl.id)}
                        disabled={isProcessing}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table Edit/Add Modal */}
      <TableModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        table={selectedTable}
        onSave={onSaveTable}
        isProcessing={isProcessing}
      />

      {/* Table QR Standee Modal */}
      <TableQRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        table={selectedTable}
        restaurantName={restaurantName}
        restaurantSlug={restaurantSlug}
      />
    </div>
  );
}

