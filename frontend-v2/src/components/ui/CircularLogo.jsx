import React from 'react';

/**
 * Reusable Circular Brand Logo Component
 * Formats the official Bhargav KB brand asset in a clean, responsive circular frame
 * with theme-adaptive borders and ambient glow.
 */
export default function CircularLogo({
  size = 'md',
  className = '',
  showGlow = false,
  alt = 'Gourmet Bistro — Bhargav KB',
}) {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const dimensionClass = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${dimensionClass} ${className}`}
    >
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-40 transition-opacity duration-300"
          style={{ backgroundColor: 'var(--color-primary)' }}
          aria-hidden="true"
        />
      )}
      <div
        className="relative w-full h-full rounded-full overflow-hidden border shadow-sm flex items-center justify-center transition-all duration-200"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <img
          src="/assets/brand-logo.png"
          alt={alt}
          className="w-full h-full object-cover object-center rounded-full"
          loading="eager"
        />
      </div>
    </div>
  );
}

