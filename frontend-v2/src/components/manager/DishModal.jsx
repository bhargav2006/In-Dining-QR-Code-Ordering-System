import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function DishModal({
  isOpen,
  onClose,
  dish = null,
  categories = [],
  onSave,
  isProcessing = false,
}) {
  const isEditing = Boolean(dish?.id);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [prepTime, setPrepTime] = useState(15);
  const [optionsJson, setOptionsJson] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (dish) {
      setName(dish.name || '');
      setDescription(dish.description || '');
      setPrice(dish.price != null ? String(dish.price) : '');
      setCategoryId(dish.category?.id ? String(dish.category.id) : (categories[0]?.id ? String(categories[0].id) : ''));
      setImageUrl(dish.imageUrl || '');
      setIsAvailable(dish.isAvailable !== false);
      setPrepTime(dish.preparationTimeMinutes != null ? dish.preparationTimeMinutes : 15);
      setOptionsJson(dish.optionsJson || '');
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId(categories[0]?.id ? String(categories[0].id) : '');
      setImageUrl('');
      setIsAvailable(true);
      setPrepTime(15);
      setOptionsJson('');
    }
    setError('');
  }, [dish, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Dish name is required.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setError('Valid positive price is required.');
      return;
    }
    if (!categoryId) {
      setError('Please select a category for this dish.');
      return;
    }

    try {
      setError('');
      await onSave({
        id: dish?.id,
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        categoryId: Number(categoryId),
        imageUrl: imageUrl.trim(),
        isAvailable,
        preparationTimeMinutes: Number(prepTime) || 15,
        optionsJson: optionsJson.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save dish');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isProcessing ? undefined : onClose}
      title={isEditing ? `Edit Dish: ${dish.name}` : 'Add New Menu Dish'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '80vh', overflowY: 'auto', paddingRight: '4px' }}>
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

        {/* Dish Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="dish-name" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
            Dish Name *
          </label>
          <input
            id="dish-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isProcessing}
            placeholder="e.g. Crispy Baja Fish Tacos"
            required
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.9rem',
            }}
          />
        </div>

        {/* Category & Price in 2 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label htmlFor="dish-category" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
              Category *
            </label>
            <select
              id="dish-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isProcessing}
              required
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '0.88rem',
              }}
            >
              <option value="" disabled>Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label htmlFor="dish-price" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
              Price (₹) *
            </label>
            <input
              id="dish-price"
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isProcessing}
              placeholder="e.g. 14.99"
              required
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '0.9rem',
                fontFamily: 'var(--gds-font-mono, monospace)',
              }}
            />
          </div>
        </div>

        {/* Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="dish-desc" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
            Description
          </label>
          <textarea
            id="dish-desc"
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isProcessing}
            placeholder="Freshly prepared artisan dish ingredients..."
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.85rem',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Image URL with preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="dish-image" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
            Image URL
          </label>
          <input
            id="dish-image"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={isProcessing}
            placeholder="https://images.unsplash.com/..."
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.85rem',
            }}
          />
          {imageUrl && (
            <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={imageUrl}
                alt="Preview"
                style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                onError={(e) => (e.target.style.display = 'none')}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Image Preview</span>
            </div>
          )}
        </div>

        {/* Preparation Time & Options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label htmlFor="dish-prep" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
              Est. Prep Time (mins)
            </label>
            <input
              id="dish-prep"
              type="number"
              min="1"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              disabled={isProcessing}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '0.88rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label htmlFor="dish-options" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
              Custom Options (JSON)
            </label>
            <input
              id="dish-options"
              type="text"
              value={optionsJson}
              onChange={(e) => setOptionsJson(e.target.value)}
              disabled={isProcessing}
              placeholder='e.g. ["Regular", "Spicy"]'
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '0.85rem',
                fontFamily: 'var(--gds-font-mono, monospace)',
              }}
            />
          </div>
        </div>

        {/* Availability Checkbox */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '6px' }}>
          <input
            id="dish-available"
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            disabled={isProcessing}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label
            htmlFor="dish-available"
            style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer' }}
          >
            Dish is Available (Checked = In Stock, Unchecked = 86'd)
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
          <Button variant="outline" type="button" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isProcessing}>
            {isProcessing ? 'Saving...' : isEditing ? 'Update Dish' : 'Create Dish'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

