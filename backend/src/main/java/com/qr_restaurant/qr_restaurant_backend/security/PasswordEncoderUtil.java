package com.qr_restaurant.qr_restaurant_backend.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

public class PasswordEncoderUtil {

    private static final String SALT = "QR_RESTAURANT_SECURE_SALT_v1_2026!";

    /**
     * Hashes raw password using SHA-256 algorithm with application salt.
     */
    public static String hashPassword(String rawPassword) {
        if (rawPassword == null) return null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String saltedInput = SALT + ":" + rawPassword;
            byte[] hash = digest.digest(saltedInput.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    /**
     * Verifies raw password against stored hash digest.
     */
    public static boolean matches(String rawPassword, String storedHash) {
        if (rawPassword == null || storedHash == null) return false;
        String newHash = hashPassword(rawPassword);
        return MessageDigest.isEqual(
                newHash.getBytes(StandardCharsets.UTF_8),
                storedHash.getBytes(StandardCharsets.UTF_8)
        );
    }
}
