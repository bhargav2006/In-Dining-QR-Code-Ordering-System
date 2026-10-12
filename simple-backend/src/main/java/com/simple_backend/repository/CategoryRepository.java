package com.simple_backend.repository;

import com.simple_backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByIsActiveTrueOrderByDisplayOrderAsc();
    List<Category> findByRestaurantIdAndIsActiveTrueOrderByDisplayOrderAsc(Long restaurantId);
    List<Category> findByRestaurantSlugAndIsActiveTrueOrderByDisplayOrderAsc(String restaurantSlug);

    List<Category> findByRestaurantIdOrderByDisplayOrderAsc(Long restaurantId);
    Optional<Category> findByName(String name);
}
