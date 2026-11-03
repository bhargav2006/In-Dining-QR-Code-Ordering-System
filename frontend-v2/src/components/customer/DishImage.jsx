import React, { useState } from 'react';
import { Utensils } from 'lucide-react';

export default function DishImage({
  src,
  alt = 'Culinary Dish',
  className = '',
  categoryName = 'Gourmet',
}) {
  const [hasError, setHasError] = useState(false);

  // If no URL or failed to load, show intentional culinary fallback
  if (!src || hasError) {
    return (
      <div
        className={`relative overflow-hidden flex flex-col items-center justify-center p-3 select-none ${className}`}
        style={{
          backgroundColor: 'var(--color-surface-sunken)',
          color: 'var(--color-text-muted)',
        }}
        aria-label={alt}
      >
        <div
          className="w-10 h-10 rounded-full border flex items-center justify-center mb-1.5 opacity-70"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <Utensils className="w-5 h-5 text-primary" />
        </div>
        <span className="text-[11px] font-medium tracking-wide uppercase opacity-75">
          {categoryName}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover object-center ${className}`}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}

