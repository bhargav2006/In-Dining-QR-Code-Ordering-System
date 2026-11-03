import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import DishImage from './DishImage';
import { DietaryBadge } from '../ui/Badge';
import Button from '../ui/Button';
import { Plus, Minus, Clock, Utensils } from 'lucide-react';

export default function DishModal({
  dish,
  isOpen,
  onClose,
  onAddToCart,
}) {
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSpecialInstructions('');
    }
  }, [isOpen]);

  if (!dish) return null;

  const price = Number(dish.price || 0);
  const totalPrice = (price * quantity).toFixed(2);
  const isAvailable = dish.isAvailable !== false && dish.available !== false;
  const isVeg = dish.isVeg !== undefined ? dish.isVeg : dish.vegetarian;
  const categoryName = dish.category?.name || 'Main Course';

  const handleConfirm = () => {
    onAddToCart(dish, quantity, specialInstructions);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={dish.name}
      subtitle={categoryName}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-4">
        {/* Visual Frame */}
        <div
          className="relative w-full aspect-16/10 rounded-xl overflow-hidden border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <DishImage
            src={dish.imageUrl}
            alt={dish.name}
            categoryName={categoryName}
            className="w-full h-full"
          />
        </div>

        {/* Dietary & Details Row */}
        <div className="flex items-center justify-between gap-2">
          <DietaryBadge vegetarian={isVeg} spicy={dish.spicy} />
          {dish.preparationTimeMinutes && (
            <div
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border"
              style={{
                backgroundColor: 'var(--color-surface-sunken)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Est. {dish.preparationTimeMinutes} mins</span>
            </div>
          )}
        </div>

        {/* Description */}
        {dish.description && (
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {dish.description}
          </p>
        )}

        {/* Special Cooking Instructions */}
        <div>
          <label
            htmlFor="special-instructions"
            className="block text-xs font-semibold mb-1.5"
            style={{ color: 'var(--color-text)' }}
          >
            Special Cooking Notes (Optional)
          </label>
          <textarea
            id="special-instructions"
            rows={2}
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="e.g., less spicy, dressing on the side, allergies..."
            className="w-full p-2.5 rounded-xl text-xs sm:text-sm border transition-all focus:outline-none resize-none"
            style={{
              backgroundColor: 'var(--color-surface-sunken)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
            maxLength={200}
          />
        </div>

        {/* Quantity Stepper & Add Button */}
        {isAvailable ? (
          <div className="pt-2 border-t flex items-center justify-between gap-3" style={{ borderColor: 'var(--color-border)' }}>
            {/* Stepper */}
            <div
              className="inline-flex items-center rounded-xl border p-1"
              style={{
                backgroundColor: 'var(--color-surface-sunken)',
                borderColor: 'var(--color-border)',
              }}
            >
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-75 transition-opacity cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-sm font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-75 transition-opacity cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to order CTA */}
            <Button
              variant="primary"
              size="md"
              onClick={handleConfirm}
              className="flex-1"
            >
              Add to Order • ₹{totalPrice}
            </Button>
          </div>
        ) : (
          <div
            className="p-3 rounded-xl border text-center text-xs font-semibold text-rose-500"
            style={{
              backgroundColor: 'var(--color-error-bg)',
              borderColor: 'var(--color-error-border)',
            }}
          >
            This dish is currently sold out.
          </div>
        )}
      </div>
    </Modal>
  );
}

