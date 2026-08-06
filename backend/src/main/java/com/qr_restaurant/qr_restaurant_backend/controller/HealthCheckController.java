package com.qr_restaurant.qr_restaurant_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HealthCheckController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "QR Restaurant Backend API");
        health.put("timestamp", LocalDateTime.now());

        try {
            jdbcTemplate.execute("SELECT 1");
            health.put("database", "CONNECTED");
        } catch (Exception e) {
            health.put("database", "DISCONNECTED: " + e.getMessage());
            health.put("status", "DOWN");
            return ResponseEntity.status(503).body(health);
        }

        return ResponseEntity.ok(health);
    }
}
