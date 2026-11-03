import React from 'react';

export default function CategoryBar({
  categories = [],
  selectedCategoryId,
  onSelectCategory,
  dishCountsByCategory = {},
}) {
  return (
    <nav
      className="w-full overflow-x-auto py-2.5 scrollbar-none select-none"
      aria-label="Menu categories"
    >
      <div className="flex items-center gap-2 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* All Items Pill */}
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`shrink-0 text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
            selectedCategoryId === null ? 'shadow-sm font-semibold' : 'hover:opacity-85'
          }`}
          style={
            selectedCategoryId === null
              ? {
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  borderColor: 'var(--color-primary)',
                }
              : {
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-muted)',
                  borderColor: 'var(--color-border)',
                }
          }
          aria-pressed={selectedCategoryId === null}
        >
          <span>All Dishes</span>
        </button>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          const count = dishCountsByCategory[cat.id];

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                isSelected ? 'shadow-sm font-semibold' : 'hover:opacity-85'
              }`}
              style={
                isSelected
                  ? {
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      borderColor: 'var(--color-primary)',
                    }
                  : {
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-muted)',
                      borderColor: 'var(--color-border)',
                    }
              }
              aria-pressed={isSelected}
            >
              <span>{cat.name}</span>
              {count !== undefined && count > 0 && (
                <span
                  className="text-[10px] px-1.5 py-0.2 rounded-full font-mono opacity-80"
                  style={{
                    backgroundColor: isSelected
                      ? 'rgba(255,255,255,0.25)'
                      : 'var(--color-surface-sunken)',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

