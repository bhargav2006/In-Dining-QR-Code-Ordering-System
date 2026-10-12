package com.simple_backend.repository;

import com.simple_backend.model.Dish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DishRepository extends JpaRepository<Dish, Long> {
    List<Dish> findByIsAvailableTrue();
    List<Dish> findByCategoryIdAndIsAvailableTrue(Long categoryId);
    List<Dish> findByNameContainingIgnoreCaseAndIsAvailableTrue(String name);

    List<Dish> findByRestaurantId(Long restaurantId);
    List<Dish> findByRestaurantIdAndIsAvailableTrue(Long restaurantId);
    List<Dish> findByRestaurantSlugAndIsAvailableTrue(String restaurantSlug);

    List<Dish> findByRestaurantIdAndCategoryIdAndIsAvailableTrue(Long restaurantId, Long categoryId);
    List<Dish> findByRestaurantSlugAndCategoryIdAndIsAvailableTrue(String restaurantSlug, Long categoryId);
}
