package com.qr_restaurant.qr_restaurant_backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class TableRequestDto {
    @NotNull(message = "Table number is required")
    @Positive(message = "Table number must be positive")
    private Integer tableNumber;

    @NotNull(message = "Capacity is required")
    @Positive(message = "Capacity must be positive")
    private Integer capacity;
}
