package com.qr_restaurant.qr_restaurant_backend.security;

import com.qr_restaurant.qr_restaurant_backend.model.enums.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Date;
import java.util.List;

/**
 * Service for generating, signing, and validating cryptographically secure JSON Web Tokens (JWT).
 * Signs tokens with HMAC-SHA256 and embeds authenticated staff role and restaurant tenancy.
 */
@Component
public class TokenProvider {

    private final SecretKey signingKey;
    private final long expirationMs;

    public TokenProvider(
            @Value("${jwt.secret:QR_RESTAURANT_SUPER_SECURE_JWT_SECRET_KEY_2026_MIN_256_BITS_LONG!}") String secret,
            @Value("${jwt.expiration-ms:86400000}") long expirationMs) {

        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    /**
     * Generates a signed JWT for an authenticated staff user.
     */
    public String generateToken(Long userId, String username, UserRole role, Long restaurantId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(username)
                .claim("userId", userId)
                .claim("role", role.name())
                .claim("restaurantId", restaurantId)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(signingKey)
                .compact();
    }

    /**
     * Generates a signed JWT with custom expiration (useful for testing expired tokens).
     */
    public String generateTokenWithCustomExpiration(Long userId, String username, UserRole role, Long restaurantId, long expirationDeltaMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationDeltaMs);

        return Jwts.builder()
                .subject(username)
                .claim("userId", userId)
                .claim("role", role.name())
                .claim("restaurantId", restaurantId)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(signingKey)
                .compact();
    }

    /**
     * Overload for backward compatibility where restaurantId might be null.
     */
    public String generateToken(Long userId, String username, UserRole role) {
        return generateToken(userId, username, role, null);
    }

    /**
     * Validates that the token signature is legitimate and the token is not expired.
     */
    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        try {
            Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token.trim());
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Parses claims from a verified JWT token.
     */
    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token.trim())
                .getPayload();
    }

    /**
     * Constructs a Spring Security Authentication object containing the verified StaffPrincipal.
     */
    public Authentication getAuthentication(String token) {
        Claims claims = parseClaims(token);

        String username = claims.getSubject();
        Object rawUserId = claims.get("userId");
        Long userId = rawUserId instanceof Number ? ((Number) rawUserId).longValue() : null;

        String roleStr = claims.get("role", String.class);
        UserRole role = roleStr != null ? UserRole.valueOf(roleStr) : UserRole.WAITER;

        Object rawRestId = claims.get("restaurantId");
        Long restaurantId = rawRestId instanceof Number ? ((Number) rawRestId).longValue() : null;

        StaffPrincipal principal = StaffPrincipal.builder()
                .userId(userId)
                .username(username)
                .role(role)
                .restaurantId(restaurantId)
                .build();

        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + role.name())
        );

        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }
}
