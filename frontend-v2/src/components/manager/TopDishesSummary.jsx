import React from 'react';

export default function TopDishesSummary({ dishes = [], categories = [], orders = [] }) {
  // Compute dish sales frequency from orders
  const dishSalesMap = {};
  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const name = item.dishName || 'Unnamed Dish';
      dishSalesMap[name] = (dishSalesMap[name] || 0) + (item.quantity || 1);
    });
  });

  const rankedDishes = dishes.map((dish) => {
    return {
      ...dish,
      ordersCount: dishSalesMap[dish.name] || 0,
    };
  }).sort((a, b) => b.ordersCount - a.ordersCount);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '24px',
      }}
    >
      {/* Menu Catalog Snapshot */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>
              Menu Catalog Status
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Active dishes and section breakdown
            </p>
          </div>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--gds-radius-full, 9999px)',
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--color-primary, #10b981)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {dishes.length} Items Live
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categories.map((cat) => {
            const catDishes = dishes.filter((d) => d.category?.id === cat.id);
            const availableCount = catDishes.filter((d) => d.isAvailable).length;

            return (
              <div
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md, 8px)',
                  background: 'var(--color-surface-sunken)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>
                    {cat.name}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                    Order #{cat.displayOrder || 0}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--gds-font-mono, monospace)',
                    fontWeight: 600,
                    color: availableCount === catDishes.length ? 'var(--color-primary, #10b981)' : '#f59e0b',
                  }}
                >
                  {availableCount}/{catDishes.length} Available
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Demand Dishes */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>
              High-Demand Dishes
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Ordered quantities across customer dining sessions
            </p>
          </div>
          <span style={{ fontSize: '1.2rem' }}>🔥</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rankedDishes.slice(0, 4).map((dish, idx) => (
            <div
              key={dish.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md, 8px)',
                background: 'var(--color-surface-sunken)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--gds-font-mono, monospace)',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    color: idx === 0 ? 'var(--color-primary, #10b981)' : 'var(--color-text-muted)',
                    minWidth: '20px',
                  }}
                >
                  #{idx + 1}
                </span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>
                    {dish.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    ₹{Number(dish.price).toFixed(2)} • {dish.category?.name || 'General'}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--gds-radius-full, 9999px)',
                    background: dish.ordersCount > 0 ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                    color: dish.ordersCount > 0 ? '#3b82f6' : 'var(--color-text-muted)',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--gds-font-mono, monospace)',
                    fontWeight: 700,
                  }}
                >
                  {dish.ordersCount} ordered
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

