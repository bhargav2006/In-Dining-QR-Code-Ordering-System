package com.qr_restaurant.qr_restaurant_backend.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class PasswordEncoderUtilTest {

    @Test
    @DisplayName("BCrypt: hashPassword generates valid BCrypt hash and matches plaintext password")
    void testEncodeAndMatch_BCrypt() {
        String rawPassword = "SecurePassword2026!";
        String encoded = PasswordEncoderUtil.hashPassword(rawPassword);

        assertNotNull(encoded);
        assertTrue(encoded.startsWith("$2a$10$") || encoded.startsWith("$2b$10$"));
        assertTrue(PasswordEncoderUtil.matches(rawPassword, encoded));
        assertFalse(PasswordEncoderUtil.matches("WrongPassword", encoded));
    }

    @Test
    @DisplayName("Legacy SHA-256: Recognizes legacy hash and verifies correctly")
    void testLegacySha256Verification() throws Exception {
        String rawPassword = "admin123";
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        String saltedInput = "QR_RESTAURANT_SECURE_SALT_v1_2026!:" + rawPassword;
        String legacyHash = Base64.getEncoder().encodeToString(digest.digest(saltedInput.getBytes(StandardCharsets.UTF_8)));

        assertTrue(PasswordEncoderUtil.isLegacyHash(legacyHash));
        assertTrue(PasswordEncoderUtil.matches(rawPassword, legacyHash));
        assertFalse(PasswordEncoderUtil.matches("wrongpass", legacyHash));
    }

    @Test
    @DisplayName("No Plaintext Fallback: Raw password does not match itself if stored unencoded")
    void testNoPlaintextFallback() {
        String plaintext = "unhashedPassword";
        // Storing "unhashedPassword" in DB and matching against "unhashedPassword" must fail (no plaintext fallback)
        assertFalse(PasswordEncoderUtil.matches(plaintext, plaintext));
    }
}
