package com.qr_restaurant.qr_restaurant_backend.dto;

import com.qr_restaurant.qr_restaurant_backend.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDto {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private UserRole role;
    private String token;

    private Long restaurantId;
    private String restaurantName;
    private String restaurantSlug;
}
