package com.qr_restaurant.qr_restaurant_backend.security;

import com.qr_restaurant.qr_restaurant_backend.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Verified security principal stored in the Spring SecurityContextHolder.
 * Encapsulates the authenticated staff member's identity, role, and restaurant tenancy.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffPrincipal implements Serializable {

    private Long userId;
    private String username;
    private UserRole role;
    private Long restaurantId;
}
