package com.simple_backend.repository;

import com.simple_backend.model.RestaurantTable;
import com.simple_backend.model.enums.TableStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
    Optional<RestaurantTable> findByTableNumber(Integer tableNumber);
    Optional<RestaurantTable> findByTableNumberAndRestaurantId(Integer tableNumber, Long restaurantId);
    Optional<RestaurantTable> findByTableNumberAndRestaurantSlug(Integer tableNumber, String restaurantSlug);

    List<RestaurantTable> findByRestaurantIdOrderByTableNumberAsc(Long restaurantId);
    List<RestaurantTable> findByRestaurantSlugOrderByTableNumberAsc(String restaurantSlug);

    Optional<RestaurantTable> findByQrToken(String qrToken);
    List<RestaurantTable> findByStatus(TableStatus status);
}
