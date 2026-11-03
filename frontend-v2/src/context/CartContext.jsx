import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('gourmet_customer_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orderNotes, setOrderNotes] = useState('');

  // Persist cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('gourmet_customer_cart', JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }, [items]);

  /**
   * Add a dish to cart with quantity and optional special request notes
   */
  const addItem = useCallback((dish, quantity = 1, specialInstructions = '') => {
    if (!dish || !dish.id || quantity <= 0) return;

    setItems((prevItems) => {
      const trimmedNotes = (specialInstructions || '').trim();
      const existingIndex = prevItems.findIndex(
        (it) => it.dishId === dish.id && (it.specialInstructions || '').trim() === trimmedNotes
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      return [
        ...prevItems,
        {
          dishId: dish.id,
          dish,
          quantity,
          specialInstructions: trimmedNotes,
          unitPrice: Number(dish.price || 0),
        },
      ];
    });
  }, []);

  /**
   * Update quantity of a cart item at given index
   */
  const updateQuantity = useCallback((index, newQuantity) => {
    setItems((prevItems) => {
      if (newQuantity <= 0) {
        return prevItems.filter((_, i) => i !== index);
      }
      const updated = [...prevItems];
      updated[index] = {
        ...updated[index],
        quantity: newQuantity,
      };
      return updated;
    });
  }, []);

  /**
   * Remove item at given index
   */
  const removeItem = useCallback((index) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  }, []);

  /**
   * Clear all items and order notes
   */
  const clearCart = useCallback(() => {
    setItems([]);
    setOrderNotes('');
    try {
      localStorage.removeItem('gourmet_customer_cart');
    } catch {
      // Ignore
    }
  }, []);

  // Calculate totals
  const { itemCount, subtotal, taxEstimate, totalEstimate } = useMemo(() => {
    const count = items.reduce((acc, it) => acc + (it.quantity || 0), 0);
    const sub = items.reduce((acc, it) => acc + (Number(it.unitPrice || 0) * (it.quantity || 0)), 0);
    const tax = Math.round((sub * 0.05) * 100) / 100;
    const total = Math.round((sub + tax) * 100) / 100;

    return {
      itemCount: count,
      subtotal: sub,
      taxEstimate: tax,
      totalEstimate: total,
    };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        taxEstimate,
        totalEstimate,
        orderNotes,
        setOrderNotes,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

