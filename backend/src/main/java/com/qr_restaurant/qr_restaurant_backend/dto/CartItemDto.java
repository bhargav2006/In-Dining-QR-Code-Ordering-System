package com.qr_restaurant.qr_restaurant_backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CartItemDto {
    @NotNull(message = "Dish ID is required")
    private Long dishId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private String specialInstructions;
}
