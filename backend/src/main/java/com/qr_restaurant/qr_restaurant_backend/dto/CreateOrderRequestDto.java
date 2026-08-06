package com.qr_restaurant.qr_restaurant_backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequestDto {
    @NotNull(message = "Session token is required")
    private String sessionToken;

    @NotEmpty(message = "Cart items cannot be empty")
    private List<CartItemDto> items;

    private String notes;
}
