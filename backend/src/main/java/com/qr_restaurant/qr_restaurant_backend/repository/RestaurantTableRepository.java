package com.qr_restaurant.qr_restaurant_backend.repository;

import com.qr_restaurant.qr_restaurant_backend.model.RestaurantTable;
import com.qr_restaurant.qr_restaurant_backend.model.enums.TableStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
    Optional<RestaurantTable> findByTableNumber(Integer tableNumber);
    Optional<RestaurantTable> findByRestaurantIdAndTableNumber(Long restaurantId, Integer tableNumber);
    Optional<RestaurantTable> findByRestaurantSlugAndTableNumber(String restaurantSlug, Integer tableNumber);

    Optional<RestaurantTable> findByQrToken(String qrToken);

    List<RestaurantTable> findByStatus(TableStatus status);
    List<RestaurantTable> findByRestaurantIdAndStatus(Long restaurantId, TableStatus status);

    List<RestaurantTable> findAllByOrderByTableNumberAsc();
    List<RestaurantTable> findByRestaurantIdOrderByTableNumberAsc(Long restaurantId);
}
