package com.qr_restaurant.qr_restaurant_backend.repository;

import com.qr_restaurant.qr_restaurant_backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
    Optional<Category> findByNameAndRestaurantId(String name, Long restaurantId);

    List<Category> findByIsActiveTrueOrderByDisplayOrderAsc();
    List<Category> findByRestaurantIdAndIsActiveTrueOrderByDisplayOrderAsc(Long restaurantId);

    List<Category> findAllByOrderByDisplayOrderAsc();
    List<Category> findByRestaurantIdOrderByDisplayOrderAsc(Long restaurantId);
}
