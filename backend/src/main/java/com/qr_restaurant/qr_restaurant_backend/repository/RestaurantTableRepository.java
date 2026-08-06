package com.qr_restaurant.qr_restaurant_backend.repository;

import com.qr_restaurant.qr_restaurant_backend.model.RestaurantTable;
import com.qr_restaurant.qr_restaurant_backend.model.enums.TableStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
    Optional<RestaurantTable> findByTableNumber(Integer tableNumber);
    Optional<RestaurantTable> findByQrToken(String qrToken);
    List<RestaurantTable> findByStatus(TableStatus status);
    List<RestaurantTable> findAllByOrderByTableNumberAsc();
}
