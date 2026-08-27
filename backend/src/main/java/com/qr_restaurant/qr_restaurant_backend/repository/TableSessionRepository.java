package com.qr_restaurant.qr_restaurant_backend.repository;

import com.qr_restaurant.qr_restaurant_backend.model.TableSession;
import com.qr_restaurant.qr_restaurant_backend.model.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TableSessionRepository extends JpaRepository<TableSession, Long> {
    Optional<TableSession> findBySessionToken(String sessionToken);

    Optional<TableSession> findFirstByTableIdAndStatusOrderByStartTimeDesc(Long tableId, SessionStatus status);
    Optional<TableSession> findFirstByTableNumberAndStatusOrderByStartTimeDesc(Integer tableNumber, SessionStatus status);
    Optional<TableSession> findFirstByRestaurantIdAndTableNumberAndStatusOrderByStartTimeDesc(Long restaurantId, Integer tableNumber, SessionStatus status);
    Optional<TableSession> findFirstByRestaurantSlugAndTableNumberAndStatusOrderByStartTimeDesc(String restaurantSlug, Integer tableNumber, SessionStatus status);

    List<TableSession> findAllByTableIdAndStatusOrderByStartTimeDesc(Long tableId, SessionStatus status);
    List<TableSession> findAllByTableNumberAndStatusOrderByStartTimeDesc(Integer tableNumber, SessionStatus status);

    List<TableSession> findByStatus(SessionStatus status);
    List<TableSession> findByRestaurantIdAndStatus(Long restaurantId, SessionStatus status);

    default Optional<TableSession> findByTableIdAndStatus(Long tableId, SessionStatus status) {
        return findFirstByTableIdAndStatusOrderByStartTimeDesc(tableId, status);
    }

    default Optional<TableSession> findByTableNumberAndStatus(Integer tableNumber, SessionStatus status) {
        return findFirstByTableNumberAndStatusOrderByStartTimeDesc(tableNumber, status);
    }
}
