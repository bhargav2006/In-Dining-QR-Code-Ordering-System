package com.qr_restaurant.qr_restaurant_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequestDto {
    @NotBlank(message = "Category name is required")
    private String name;

    private Integer displayOrder;

    private Boolean isActive;
}
