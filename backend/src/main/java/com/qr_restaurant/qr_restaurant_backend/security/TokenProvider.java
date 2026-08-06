package com.qr_restaurant.qr_restaurant_backend.security;

import com.qr_restaurant.qr_restaurant_backend.model.enums.UserRole;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.UUID;

public class TokenProvider {

    private static final String SECRET_KEY = "QR_RESTAURANT_SUPER_SECRET_KEY_FOR_TOKEN_GEN_2026";

    /**
     * Generates a signed authentication token with payload and HMAC-SHA256 signature.
     */
    public static String generateToken(Long userId, String username, UserRole role) {
        long expiryTime = System.currentTimeMillis() + (86400 * 1000L); // 24 hours
        String payload = userId + ":" + username + ":" + role.name() + ":" + expiryTime + ":" + UUID.randomUUID().toString();
        String encodedPayload = Base64.getUrlEncoder().encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        String signature = hmacSha256(encodedPayload, SECRET_KEY);
        return encodedPayload + "." + signature;
    }

    /**
     * Validates token signature and expiration.
     */
    public static boolean validateToken(String token) {
        if (token == null || !token.contains(".")) return false;
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 2) return false;

            String payloadEncoded = parts[0];
            String signature = parts[1];

            String expectedSig = hmacSha256(payloadEncoded, SECRET_KEY);
            if (!expectedSig.equals(signature)) return false;

            String payload = new String(Base64.getUrlDecoder().decode(payloadEncoded), StandardCharsets.UTF_8);
            String[] fields = payload.split(":");
            if (fields.length < 4) return false;

            long expiryTime = Long.parseLong(fields[3]);
            return System.currentTimeMillis() < expiryTime;
        } catch (Exception e) {
            return false;
        }
    }

    private static String hmacSha256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hmacData = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hmacData);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error calculating HMAC-SHA256", e);
        }
    }
}
