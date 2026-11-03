import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  searchQuery,
  onSearchChange,
  dietaryFilter,
  onDietaryFilterChange,
}) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: 'var(--color-text-muted)' }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search dishes, ingredients, starters..."
          className="w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm border transition-all focus:outline-none"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:opacity-80"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dietary filter toggle pills */}
      <div
        className="inline-flex items-center p-1 rounded-xl border shrink-0 self-start sm:self-auto"
        style={{
          backgroundColor: 'var(--color-surface-sunken)',
          borderColor: 'var(--color-border)',
        }}
        role="group"
        aria-label="Dietary preference"
      >
        <button
          type="button"
          onClick={() => onDietaryFilterChange('ALL')}
          className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
            dietaryFilter === 'ALL' ? 'shadow-sm font-semibold' : 'hover:opacity-75'
          }`}
          style={
            dietaryFilter === 'ALL'
              ? {
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                }
              : {
                  color: 'var(--color-text-muted)',
                }
          }
        >
          All
        </button>

        <button
          type="button"
          onClick={() => onDietaryFilterChange('VEG')}
          className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
            dietaryFilter === 'VEG' ? 'shadow-sm font-semibold' : 'hover:opacity-75'
          }`}
          style={
            dietaryFilter === 'VEG'
              ? {
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-success)',
                }
              : {
                  color: 'var(--color-text-muted)',
                }
          }
        >
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: 'var(--color-success)' }} />
          Veg
        </button>

        <button
          type="button"
          onClick={() => onDietaryFilterChange('NON_VEG')}
          className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
            dietaryFilter === 'NON_VEG' ? 'shadow-sm font-semibold' : 'hover:opacity-75'
          }`}
          style={
            dietaryFilter === 'NON_VEG'
              ? {
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-error)',
                }
              : {
                  color: 'var(--color-text-muted)',
                }
          }
        >
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: 'var(--color-error)' }} />
          Non-Veg
        </button>
      </div>
    </div>
  );
}

