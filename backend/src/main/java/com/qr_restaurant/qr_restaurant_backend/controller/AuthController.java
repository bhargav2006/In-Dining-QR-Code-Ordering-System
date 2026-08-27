package com.qr_restaurant.qr_restaurant_backend.controller;

import com.qr_restaurant.qr_restaurant_backend.dto.AuthResponseDto;
import com.qr_restaurant.qr_restaurant_backend.dto.LoginRequestDto;
import com.qr_restaurant.qr_restaurant_backend.dto.RegisterRestaurantDto;
import com.qr_restaurant.qr_restaurant_backend.model.Restaurant;
import com.qr_restaurant.qr_restaurant_backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register-restaurant")
    public ResponseEntity<AuthResponseDto> registerRestaurant(@Valid @RequestBody RegisterRestaurantDto request) {
        return ResponseEntity.ok(authService.registerRestaurant(request));
    }

    @GetMapping("/restaurants")
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        return ResponseEntity.ok(authService.getAllRestaurants());
    }
}
