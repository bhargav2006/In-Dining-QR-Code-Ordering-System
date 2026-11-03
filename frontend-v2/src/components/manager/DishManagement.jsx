import React, { useState, useMemo } from 'react';
import Button from '../ui/Button';
import DishModal from './DishModal';

export default function DishManagement({
  dishes = [],
  categories = [],
  onSaveDish,
  onToggleAvailability,
  onDeleteDish,
  isProcessing = false,
  processingActionIds = new Set(),
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL'); // 'ALL' | 'AVAILABLE' | '86'
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      // Category filter
      if (selectedCategoryFilter !== 'ALL' && dish.category?.id !== Number(selectedCategoryFilter)) {
        return false;
      }
      // Availability filter
      if (availabilityFilter === 'AVAILABLE' && !dish.isAvailable) return false;
      if (availabilityFilter === '86' && dish.isAvailable) return false;
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = dish.name.toLowerCase().includes(query);
        const matchesDesc = dish.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [dishes, selectedCategoryFilter, availabilityFilter, searchQuery]);

  const handleCreate = () => {
    setSelectedDish(null);
    setModalOpen(true);
  };

  const handleEdit = (dish) => {
    setSelectedDish(dish);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    await onDeleteDish(id);
    setDeleteConfirmId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--color-text)' }}>
            Menu Dish Catalog ({dishes.length})
          </h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Manage menu items, pricing, special preparation notes, and 86 availability toggles.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleCreate} disabled={isProcessing}>
          <span>+ Add New Dish</span>
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* Search & Availability row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
            <span style={{ fontSize: '1rem' }}>🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes by name or ingredient..."
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-sunken)',
                color: 'var(--color-text)',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'ALL', label: 'All Items' },
              { id: 'AVAILABLE', label: 'In Stock' },
              { id: '86', label: "86'd (Unavailable)" },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setAvailabilityFilter(pill.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--gds-radius-full, 9999px)',
                  border: availabilityFilter === pill.id
                    ? '1px solid var(--color-primary, #10b981)'
                    : '1px solid var(--color-border)',
                  background: availabilityFilter === pill.id
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'transparent',
                  color: availabilityFilter === pill.id ? 'var(--color-primary, #10b981)' : 'var(--color-text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          <button
            onClick={() => setSelectedCategoryFilter('ALL')}
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--gds-radius-full, 9999px)',
              border: selectedCategoryFilter === 'ALL'
                ? '1px solid var(--color-primary, #10b981)'
                : '1px solid var(--color-border)',
              background: selectedCategoryFilter === 'ALL'
                ? 'var(--color-primary, #10b981)'
                : 'var(--color-surface-sunken)',
              color: selectedCategoryFilter === 'ALL' ? '#ffffff' : 'var(--color-text)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            All Categories ({dishes.length})
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategoryFilter === String(cat.id);
            const count = dishes.filter((d) => d.category?.id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(String(cat.id))}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--gds-radius-full, 9999px)',
                  border: isSelected
                    ? '1px solid var(--color-primary, #10b981)'
                    : '1px solid var(--color-border)',
                  background: isSelected
                    ? 'var(--color-primary, #10b981)'
                    : 'var(--color-surface-sunken)',
                  color: isSelected ? '#ffffff' : 'var(--color-text)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Dishes Grid */}
      {filteredDishes.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg, 12px)',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🍽️</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--color-text)' }}>
            No Dishes Match Filters
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Try adjusting your search query, category selection, or add a new menu dish.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredDishes.map((dish) => {
            const isToggling = processingActionIds.has(`dish-toggle-${dish.id}`);
            const isDeleting = processingActionIds.has(`dish-delete-${dish.id}`);
            const isConfirmingDelete = deleteConfirmId === dish.id;

            return (
              <div
                key={dish.id}
                style={{
                  background: 'var(--color-surface)',
                  border: dish.isAvailable
                    ? '1px solid var(--color-border)'
                    : '2px dashed rgba(239, 68, 68, 0.4)',
                  borderRadius: 'var(--radius-lg, 12px)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--shadow-sm)',
                  opacity: dish.isAvailable ? 1 : 0.85,
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Dish Card Header with optional Image */}
                <div style={{ position: 'relative', height: '140px', background: 'var(--color-surface-sunken)' }}>
                  {dish.imageUrl ? (
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      🍽️
                    </div>
                  )}

                  {/* 86 / Availability Overlay Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                    }}
                  >
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--gds-radius-full, 9999px)',
                        background: dish.isAvailable ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.95)',
                        color: '#ffffff',
                        fontSize: '0.725rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      }}
                    >
                      {dish.isAvailable ? 'AVAILABLE' : '86’D / OUT'}
                    </span>
                  </div>

                  {/* Category Pill Tag */}
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(0, 0, 0, 0.75)',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}
                    >
                      {dish.category?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>

                {/* Dish Details Body */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text)' }}>
                      {dish.name}
                    </h3>
                    <span
                      style={{
                        fontFamily: 'var(--gds-font-mono, monospace)',
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        color: 'var(--color-primary, #10b981)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ₹{Number(dish.price).toFixed(2)}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.8rem',
                      color: 'var(--color-text-muted)',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: 1,
                    }}
                  >
                    {dish.description || 'No detailed description provided.'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.725rem', color: 'var(--color-text-muted)', paddingTop: '4px' }}>
                    <span>⏱️ {dish.preparationTimeMinutes || 15} mins</span>
                    {dish.optionsJson && (
                      <span title={dish.optionsJson} style={{ fontFamily: 'var(--gds-font-mono, monospace)' }}>
                        ⚙️ Options configured
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Toolbar */}
                <div
                  style={{
                    padding: '10px 16px',
                    borderTop: '1px solid var(--color-border)',
                    background: 'var(--color-surface-sunken)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  {/* 86 Toggle Button */}
                  <button
                    onClick={() => onToggleAvailability(dish.id)}
                    disabled={isToggling || isProcessing}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-md, 8px)',
                      border: dish.isAvailable
                        ? '1px solid rgba(239, 68, 68, 0.4)'
                        : '1px solid rgba(16, 185, 129, 0.4)',
                      background: dish.isAvailable ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.12)',
                      color: dish.isAvailable ? '#ef4444' : 'var(--color-primary, #10b981)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    title={dish.isAvailable ? 'Mark item as 86 / Out of Stock' : 'Mark item as In Stock'}
                  >
                    <span>{dish.isAvailable ? '🚫 86 Dish' : '✅ Re-enable'}</span>
                  </button>

                  {/* Edit / Delete */}
                  {isConfirmingDelete ? (
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={() => handleDelete(dish.id)}
                        disabled={isDeleting || isProcessing}
                      >
                        Confirm Delete
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
                        onClick={() => handleEdit(dish)}
                        disabled={isProcessing}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        onClick={() => setDeleteConfirmId(dish.id)}
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

      {/* Dish Modal */}
      <DishModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        dish={selectedDish}
        categories={categories}
        onSave={onSaveDish}
        isProcessing={isProcessing}
      />
    </div>
  );
}

