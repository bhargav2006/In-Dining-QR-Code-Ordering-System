package com.qr_restaurant.qr_restaurant_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRestaurantDto {

    @NotBlank(message = "Restaurant name is required")
    private String restaurantName;

    private String description;
    private String address;
    private String phone;
    private String logoUrl;

    @NotBlank(message = "Owner/Manager name is required")
    private String fullName;

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    private String email;
}
