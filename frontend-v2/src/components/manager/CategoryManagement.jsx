import React, { useState } from 'react';
import Button from '../ui/Button';
import CategoryModal from './CategoryModal';

export default function CategoryManagement({
  categories = [],
  dishes = [],
  onSaveCategory,
  onDeleteCategory,
  isProcessing = false,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleCreate = () => {
    setSelectedCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    await onDeleteCategory(id);
    setDeleteConfirmId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header / Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--color-text)' }}>
            Menu Categories ({categories.length})
          </h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Organize customer menu sections, display ordering, and visibility.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleCreate} disabled={isProcessing}>
          <span>+ Add Category</span>
        </Button>
      </div>

      {/* Categories Table / List */}
      {categories.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg, 12px)',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🗂️</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--color-text)' }}>
            No Categories Yet
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Create your first menu category (e.g. Appetizers, Mains, Beverages).
          </p>
          <Button variant="primary" size="sm" onClick={handleCreate}>
            Create Category
          </Button>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg, 12px)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr
                  style={{
                    background: 'var(--color-surface-sunken)',
                    borderBottom: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <th style={{ padding: '12px 16px' }}>Display Order</th>
                  <th style={{ padding: '12px 16px' }}>Category Name</th>
                  <th style={{ padding: '12px 16px' }}>Dishes Assigned</th>
                  <th style={{ padding: '12px 16px' }}>Visibility</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => {
                  const dishCount = dishes.filter((d) => d.category?.id === cat.id).length;
                  const isConfirmingDelete = deleteConfirmId === cat.id;

                  return (
                    <tr
                      key={cat.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '14px 16px', fontFamily: 'var(--gds-font-mono, monospace)', fontWeight: 700 }}>
                        #{cat.displayOrder || 0}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.95rem' }}>
                          {cat.name}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--gds-radius-full, 9999px)',
                            background: 'var(--color-surface-sunken)',
                            fontFamily: 'var(--gds-font-mono, monospace)',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        >
                          {dishCount} {dishCount === 1 ? 'dish' : 'dishes'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 'var(--gds-radius-full, 9999px)',
                            background: cat.isActive !== false ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: cat.isActive !== false ? 'var(--color-primary, #10b981)' : '#ef4444',
                            fontSize: '0.725rem',
                            fontWeight: 700,
                          }}
                        >
                          {cat.isActive !== false ? 'ACTIVE' : 'HIDDEN'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {isConfirmingDelete ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>
                              Delete?
                            </span>
                            <Button
                              variant="danger"
                              size="xs"
                              onClick={() => handleDelete(cat.id)}
                              disabled={isProcessing}
                            >
                              Yes, Delete
                            </Button>
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => setDeleteConfirmId(null)}
                              disabled={isProcessing}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleEdit(cat)}
                              disabled={isProcessing}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="xs"
                              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                              onClick={() => setDeleteConfirmId(cat.id)}
                              disabled={isProcessing}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Create/Edit Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={selectedCategory}
        onSave={onSaveCategory}
        isProcessing={isProcessing}
      />
    </div>
  );
}

