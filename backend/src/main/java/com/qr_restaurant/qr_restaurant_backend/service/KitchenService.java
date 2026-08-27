package com.qr_restaurant.qr_restaurant_backend.service;

import com.qr_restaurant.qr_restaurant_backend.dto.OrderResponseDto;
import com.qr_restaurant.qr_restaurant_backend.exception.ResourceNotFoundException;
import com.qr_restaurant.qr_restaurant_backend.model.Order;
import com.qr_restaurant.qr_restaurant_backend.model.Restaurant;
import com.qr_restaurant.qr_restaurant_backend.model.enums.OrderStatus;
import com.qr_restaurant.qr_restaurant_backend.repository.OrderRepository;
import com.qr_restaurant.qr_restaurant_backend.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KitchenService {

    private final OrderRepository orderRepository;
    private final RestaurantRepository restaurantRepository;
    private final CustomerService customerService;

    public List<OrderResponseDto> getActiveKitchenOrders() {
        return getActiveKitchenOrders(null);
    }

    public List<OrderResponseDto> getActiveKitchenOrders(Long restaurantId) {
        List<OrderStatus> kitchenStatuses = Arrays.asList(
                OrderStatus.PLACED,
                OrderStatus.PREPARING,
                OrderStatus.READY
        );

        Long targetRestId = resolveRestaurantId(restaurantId);

        List<Order> orders;
        if (targetRestId != null) {
            orders = orderRepository.findByRestaurantIdAndStatusInOrderByCreatedAtAsc(targetRestId, kitchenStatuses);
        } else {
            orders = orderRepository.findByStatusInOrderByCreatedAtAsc(kitchenStatuses);
        }

        return orders.stream()
                .map(customerService::mapToOrderResponseDto)
                .collect(Collectors.toList());
    }

    private Long resolveRestaurantId(Long restaurantId) {
        if (restaurantId != null) {
            return restaurantId;
        }
        return restaurantRepository.findBySlug("gourmet-bistro")
                .map(Restaurant::getId)
                .orElse(null);
    }

    @Transactional
    public OrderResponseDto updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order ID " + orderId + " not found"));

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);

        return customerService.mapToOrderResponseDto(updated);
    }
}
