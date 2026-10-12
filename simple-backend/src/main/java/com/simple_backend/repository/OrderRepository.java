package com.simple_backend.repository;

import com.simple_backend.model.Order;
import com.simple_backend.model.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findBySessionSessionTokenOrderByCreatedAtDesc(String sessionToken);
    List<Order> findByStatusInOrderByCreatedAtAsc(List<OrderStatus> statuses);
    List<Order> findByRestaurantIdAndStatusInOrderByCreatedAtAsc(Long restaurantId, List<OrderStatus> statuses);

    List<Order> findByStatusOrderByCreatedAtAsc(OrderStatus status);
    List<Order> findByRestaurantIdAndStatusOrderByCreatedAtAsc(Long restaurantId, OrderStatus status);

    List<Order> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status != 'COMPLETED'")
    long countActiveOrders();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.restaurant.id = :restaurantId AND o.status != 'COMPLETED'")
    long countActiveOrdersByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.restaurant.id = :restaurantId")
    BigDecimal calculateTotalRevenueByRestaurantId(@Param("restaurantId") Long restaurantId);
}
