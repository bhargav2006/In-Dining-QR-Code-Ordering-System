package com.simple_backend.service;

import com.simple_backend.model.Order;
import com.simple_backend.model.OrderItem;
import com.simple_backend.model.enums.OrderStatus;
import com.simple_backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class KitchenService {

    private final OrderRepository orderRepository;

    public List<Map<String, Object>> getKitchenOrders(Long restaurantId) {
        List<OrderStatus> activeStatuses = Arrays.asList(OrderStatus.PLACED, OrderStatus.PREPARING, OrderStatus.READY);
        List<Order> orders;
        if (restaurantId != null) {
            orders = orderRepository.findByRestaurantIdAndStatusInOrderByCreatedAtAsc(restaurantId, activeStatuses);
        } else {
            orders = orderRepository.findByStatusInOrderByCreatedAtAsc(activeStatuses);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Order o : orders) {
            Map<String, Object> map = new HashMap<>();
            map.put("orderId", o.getId());
            map.put("orderNumber", o.getOrderNumber());
            map.put("tableNumber", o.getSession().getTable().getTableNumber());
            map.put("status", o.getStatus());
            map.put("createdAt", o.getCreatedAt());
            map.put("notes", o.getNotes());

            List<Map<String, Object>> items = new ArrayList<>();
            for (OrderItem item : o.getItems()) {
                Map<String, Object> it = new HashMap<>();
                it.put("dishName", item.getDish().getName());
                it.put("quantity", item.getQuantity());
                it.put("specialInstructions", item.getSpecialInstructions());
                items.add(it);
            }
            map.put("items", items);
            result.add(map);
        }
        return result;
    }

    public Map<String, Object> updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(status);
        order = orderRepository.save(order);

        Map<String, Object> res = new HashMap<>();
        res.put("orderId", order.getId());
        res.put("status", order.getStatus());
        return res;
    }
}
