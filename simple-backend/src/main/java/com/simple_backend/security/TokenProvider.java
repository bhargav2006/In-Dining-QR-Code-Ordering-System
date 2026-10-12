package com.simple_backend.security;

import com.simple_backend.model.enums.UserRole;
import java.util.UUID;

public class TokenProvider {

    public static String generateToken(Long userId, String username, UserRole role) {
        return "JWT-" + role.name() + "-" + username.toUpperCase() + "-" + UUID.randomUUID().toString().substring(0, 8);
    }
}
