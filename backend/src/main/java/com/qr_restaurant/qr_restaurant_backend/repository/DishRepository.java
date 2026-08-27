package com.qr_restaurant.qr_restaurant_backend.repository;

import com.qr_restaurant.qr_restaurant_backend.model.Dish;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DishRepository extends JpaRepository<Dish, Long> {
    List<Dish> findByCategoryIdAndIsAvailableTrue(Long categoryId);
    List<Dish> findByRestaurantIdAndCategoryIdAndIsAvailableTrue(Long restaurantId, Long categoryId);

    List<Dish> findByIsAvailableTrue();
    List<Dish> findByRestaurantIdAndIsAvailableTrue(Long restaurantId);

    List<Dish> findByRestaurantId(Long restaurantId);

    List<Dish> findByNameContainingIgnoreCase(String name);
    List<Dish> findByRestaurantIdAndNameContainingIgnoreCase(Long restaurantId, String name);
}
