import { useState, useEffect, useMemo, useCallback } from 'react';
import customerService from '../services/customerService';

export function useMenu({ restaurantId, restaurantSlug }) {
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState('ALL'); // 'ALL' | 'VEG' | 'NON_VEG'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenuData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Parallel fetch to eliminate waterfalls
      const [cats, menuItems] = await Promise.all([
        customerService.getCategories({ restaurantId, restaurantSlug }).catch((err) => {
          console.warn('Failed to load categories:', err);
          return [];
        }),
        customerService.getMenu({ restaurantId, restaurantSlug }).catch((err) => {
          console.warn('Failed to load menu dishes:', err);
          return [];
        }),
      ]);

      setCategories(cats || []);
      setDishes(menuItems || []);
    } catch (err) {
      setError(err.message || 'Unable to load restaurant menu');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId, restaurantSlug]);

  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  // Client-side filtering for fast responsive typing and switching
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      // Category filter
      if (selectedCategoryId !== null) {
        const dishCatId = dish.category?.id || dish.categoryId;
        if (dishCatId !== selectedCategoryId) return false;
      }

      // Dietary filter
      const isVeg = dish.isVeg !== undefined ? dish.isVeg : dish.vegetarian;
      if (dietaryFilter === 'VEG' && !isVeg) return false;
      if (dietaryFilter === 'NON_VEG' && isVeg) return false;

      // Keyword search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatches = (dish.name || '').toLowerCase().includes(query);
        const descMatches = (dish.description || '').toLowerCase().includes(query);
        if (!nameMatches && !descMatches) return false;
      }

      return true;
    });
  }, [dishes, selectedCategoryId, dietaryFilter, searchQuery]);

  return {
    categories,
    dishes,
    filteredDishes,
    selectedCategoryId,
    setSelectedCategoryId,
    searchQuery,
    setSearchQuery,
    dietaryFilter,
    setDietaryFilter,
    isLoading,
    error,
    refreshMenu: fetchMenuData,
  };
}

export default useMenu;

