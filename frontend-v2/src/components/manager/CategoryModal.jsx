import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function CategoryModal({
  isOpen,
  onClose,
  category = null,
  onSave,
  isProcessing = false,
}) {
  const isEditing = Boolean(category?.id);
  const [name, setName] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDisplayOrder(category.displayOrder != null ? category.displayOrder : 1);
      setIsActive(category.isActive !== false);
    } else {
      setName('');
      setDisplayOrder(1);
      setIsActive(true);
    }
    setError('');
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    try {
      setError('');
      await onSave({
        id: category?.id,
        name: name.trim(),
        displayOrder: Number(displayOrder) || 0,
        isActive,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save category');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isProcessing ? undefined : onClose}
      title={isEditing ? `Edit Category: ${category.name}` : 'Create Menu Category'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md, 8px)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="category-name" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
            Category Name *
          </label>
          <input
            id="category-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isProcessing}
            placeholder="e.g. Artisanal Desserts"
            required
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.9rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="category-order" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
            Display Order
          </label>
          <input
            id="category-order"
            type="number"
            min="0"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            disabled={isProcessing}
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.9rem',
            }}
          />
          <span style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)' }}>
            Lower numbers appear first on the customer menu.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
          <input
            id="category-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={isProcessing}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label
            htmlFor="category-active"
            style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer' }}
          >
            Category is Active (Visible on Menu)
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
          <Button variant="outline" type="button" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isProcessing}>
            {isProcessing ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

