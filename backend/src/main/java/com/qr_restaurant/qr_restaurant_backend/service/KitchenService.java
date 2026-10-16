package com.qr_restaurant.qr_restaurant_backend.service;

import com.qr_restaurant.qr_restaurant_backend.dto.OrderResponseDto;
import com.qr_restaurant.qr_restaurant_backend.exception.BadRequestException;
import com.qr_restaurant.qr_restaurant_backend.exception.ResourceNotFoundException;
import com.qr_restaurant.qr_restaurant_backend.model.Order;
import com.qr_restaurant.qr_restaurant_backend.model.enums.OrderStatus;
import com.qr_restaurant.qr_restaurant_backend.repository.OrderRepository;
import com.qr_restaurant.qr_restaurant_backend.security.SecurityUtil;
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
    private final CustomerService customerService;

    public List<OrderResponseDto> getActiveKitchenOrders() {
        List<OrderStatus> kitchenStatuses = Arrays.asList(
                OrderStatus.PLACED,
                OrderStatus.PREPARING,
                OrderStatus.READY
        );

        Long targetRestId = SecurityUtil.getRequiredRestaurantId();
        List<Order> orders = orderRepository.findByRestaurantIdAndStatusInOrderByCreatedAtAsc(targetRestId, kitchenStatuses);

        return orders.stream()
                .map(customerService::mapToOrderResponseDto)
                .collect(Collectors.toList());
    }

    public List<OrderResponseDto> getActiveKitchenOrders(Long ignoredRestaurantId) {
        return getActiveKitchenOrders();
    }

    @Transactional
    public OrderResponseDto updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Long targetRestId = SecurityUtil.getRequiredRestaurantId();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order ID " + orderId + " not found"));

        if (order.getRestaurant() == null || !order.getRestaurant().getId().equals(targetRestId)) {
            throw new BadRequestException("Order ID " + orderId + " does not belong to your restaurant");
        }

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);

        return customerService.mapToOrderResponseDto(updated);
    }
}
