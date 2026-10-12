package com.simple_backend.controller;

import com.simple_backend.model.Restaurant;
import com.simple_backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register-restaurant")
    public ResponseEntity<Map<String, Object>> registerRestaurant(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(authService.registerRestaurant(request));
    }

    @GetMapping("/restaurants")
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        return ResponseEntity.ok(authService.getAllRestaurants());
    }
}
