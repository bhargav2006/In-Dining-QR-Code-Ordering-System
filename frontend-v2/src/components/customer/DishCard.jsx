import React from 'react';
import { Plus, Minus, Clock } from 'lucide-react';
import DishImage from './DishImage';
import { DietaryBadge } from '../ui/Badge';

export default function DishCard({
  dish,
  cartQuantity = 0,
  onAddToCart,
  onUpdateQuantity,
  onOpenDetail,
}) {
  const isAvailable = dish.isAvailable !== false && dish.available !== false;
  const isVeg = dish.isVeg !== undefined ? dish.isVeg : dish.vegetarian;
  const price = Number(dish.price || 0).toFixed(2);
  const categoryName = dish.category?.name || 'Main';

  return (
    <article
      className="group relative rounded-2xl border p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div>
        {/* Image Frame */}
        <div
          className="relative w-full aspect-16/10 rounded-xl overflow-hidden mb-3 border cursor-pointer select-none"
          style={{ borderColor: 'var(--color-border)' }}
          onClick={() => onOpenDetail(dish)}
        >
          <DishImage
            src={dish.imageUrl}
            alt={dish.name}
            categoryName={categoryName}
            className="w-full h-full transition-transform duration-300 group-hover:scale-105"
          />

          {/* Availability overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-900/90 text-rose-100 border border-rose-700">
                Currently Sold Out
              </span>
            </div>
          )}

          {/* Prep time chip */}
          {dish.preparationTimeMinutes && isAvailable && (
            <div
              className="absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-md flex items-center gap-1 border shadow-xs"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.15)',
              }}
            >
              <Clock className="w-3 h-3" />
              <span>{dish.preparationTimeMinutes}m</span>
            </div>
          )}
        </div>

        {/* Dietary and Category Tag */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <DietaryBadge vegetarian={isVeg} spicy={dish.spicy} />
          <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-subtle)' }}>
            {categoryName}
          </span>
        </div>

        {/* Dish Title & Description */}
        <h3
          className="text-sm sm:text-base font-bold tracking-tight mb-1 cursor-pointer hover:underline"
          onClick={() => onOpenDetail(dish)}
        >
          {dish.name}
        </h3>

        {dish.description && (
          <p
            className="text-xs line-clamp-2 mb-3 leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {dish.description}
          </p>
        )}
      </div>

      {/* Pricing & Add to Cart Controls */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t mt-auto" style={{ borderColor: 'var(--color-divider)' }}>
        <div className="flex flex-col">
          <span className="text-[11px]" style={{ color: 'var(--color-text-subtle)' }}>
            Price
          </span>
          <span className="text-sm sm:text-base font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            ₹{price}
          </span>
        </div>

        {/* Cart Stepper or Add Button */}
        {isAvailable ? (
          cartQuantity > 0 ? (
            <div
              className="inline-flex items-center rounded-xl border p-0.5 shadow-xs"
              style={{
                backgroundColor: 'var(--color-primary-container)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-on-primary-container)',
              }}
            >
              <button
                type="button"
                onClick={() => onUpdateQuantity(cartQuantity - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-75 transition-opacity cursor-pointer"
                aria-label={`Decrease quantity of ${dish.name}`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center text-xs font-bold font-mono">
                {cartQuantity}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(cartQuantity + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-75 transition-opacity cursor-pointer"
                aria-label={`Increase quantity of ${dish.name}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAddToCart(dish)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-xs hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                borderColor: 'transparent',
              }}
              aria-label={`Add ${dish.name} to order`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )
        ) : (
          <span className="text-xs font-medium italic opacity-60" style={{ color: 'var(--color-text-muted)' }}>
            Unavailable
          </span>
        )}
      </div>
    </article>
  );
}
