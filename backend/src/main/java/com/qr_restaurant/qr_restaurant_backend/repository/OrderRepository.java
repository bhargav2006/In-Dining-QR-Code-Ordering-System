package com.qr_restaurant.qr_restaurant_backend.repository;

import com.qr_restaurant.qr_restaurant_backend.model.Order;
import com.qr_restaurant.qr_restaurant_backend.model.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByTableSessionIdOrderByCreatedAtDesc(Long sessionId);
    List<Order> findByTableNumberOrderByCreatedAtDesc(Integer tableNumber);
    List<Order> findByStatusInOrderByCreatedAtAsc(List<OrderStatus> statuses);
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.createdAt >= :startDate AND o.status != 'CANCELLED'")
    BigDecimal calculateTotalSalesSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(DISTINCT o.tableSession.id) FROM Order o WHERE o.createdAt >= :startDate AND o.status != 'CANCELLED'")
    Long countOrdersSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt < :endDate AND o.status != 'CANCELLED'")
    BigDecimal calculateTotalSalesBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(DISTINCT o.tableSession.id) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt < :endDate AND o.status != 'CANCELLED'")
    Long countOrdersBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status != 'CANCELLED'")
    BigDecimal calculateAllTimeSales();

    @Query("SELECT COUNT(DISTINCT o.tableSession.id) FROM Order o WHERE o.status != 'CANCELLED'")
    Long countAllTimeOrders();

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByCreatedAtGreaterThanEqualOrderByCreatedAtDesc(LocalDateTime startDate);
}
