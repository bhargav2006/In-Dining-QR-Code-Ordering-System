package com.qr_restaurant.qr_restaurant_backend.dto;

import com.qr_restaurant.qr_restaurant_backend.model.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDto {
    private Long orderId;
    private String orderNumber;
    private Integer tableNumber;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private BigDecimal taxAmount;
    private String notes;
    private List<OrderItemResponseDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
