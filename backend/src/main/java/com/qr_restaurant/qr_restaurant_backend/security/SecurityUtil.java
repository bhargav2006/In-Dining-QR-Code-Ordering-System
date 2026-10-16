package com.qr_restaurant.qr_restaurant_backend.security;

import com.qr_restaurant.qr_restaurant_backend.exception.BadRequestException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Helper utility to extract authenticated staff details and enforce tenant boundaries.
 */
public class SecurityUtil {

    /**
     * Retrieves the authenticated staff member's principal from the current security context.
     * Throws AccessDeniedException if not authenticated.
     */
    public static StaffPrincipal getCurrentStaff() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof StaffPrincipal staff) {
            return staff;
        }
        throw new AccessDeniedException("Unauthorized: No authenticated staff member found in security context");
    }

    /**
     * Resolves and returns the restaurant ID belonging to the authenticated staff member.
     * Guarantees tenant isolation by never trusting client-supplied query parameters or body fields.
     */
    public static Long getRequiredRestaurantId() {
        StaffPrincipal staff = getCurrentStaff();
        if (staff.getRestaurantId() == null) {
            throw new BadRequestException("Authenticated user is not linked to any restaurant");
        }
        return staff.getRestaurantId();
    }
}
