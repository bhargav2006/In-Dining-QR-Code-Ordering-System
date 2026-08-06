package com.qr_restaurant.qr_restaurant_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponseDto {
    private Long id;
    private Long dishId;
    private String dishName;
    private BigDecimal unitPrice;
    private Integer quantity;
    private String specialInstructions;
    private BigDecimal itemTotal;
}
