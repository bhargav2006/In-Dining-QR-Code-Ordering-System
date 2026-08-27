package com.qr_restaurant.qr_restaurant_backend.controller;

import com.qr_restaurant.qr_restaurant_backend.dto.*;
import com.qr_restaurant.qr_restaurant_backend.model.Category;
import com.qr_restaurant.qr_restaurant_backend.model.Dish;
import com.qr_restaurant.qr_restaurant_backend.model.RestaurantTable;
import com.qr_restaurant.qr_restaurant_backend.service.ManagerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
public class ManagerController {

    private final ManagerService managerService;

    // --- Categories ---
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories(@RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.ok(managerService.getAllCategories(restaurantId));
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@Valid @RequestBody CategoryRequestDto dto, @RequestParam(required = false) Long restaurantId) {
        return new ResponseEntity<>(managerService.createCategory(dto, restaurantId), HttpStatus.CREATED);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequestDto dto) {
        return ResponseEntity.ok(managerService.updateCategory(id, dto));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        managerService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // --- Dishes ---
    @GetMapping("/dishes")
    public ResponseEntity<List<Dish>> getAllDishes(@RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.ok(managerService.getAllDishes(restaurantId));
    }

    @PostMapping("/dishes")
    public ResponseEntity<Dish> createDish(@Valid @RequestBody DishRequestDto dto, @RequestParam(required = false) Long restaurantId) {
        return new ResponseEntity<>(managerService.createDish(dto, restaurantId), HttpStatus.CREATED);
    }

    @PutMapping("/dishes/{id}")
    public ResponseEntity<Dish> updateDish(@PathVariable Long id, @Valid @RequestBody DishRequestDto dto) {
        return ResponseEntity.ok(managerService.updateDish(id, dto));
    }

    @PatchMapping("/dishes/{id}/toggle-availability")
    public ResponseEntity<Dish> toggleDishAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(managerService.toggleDishAvailability(id));
    }

    @DeleteMapping("/dishes/{id}")
    public ResponseEntity<Void> deleteDish(@PathVariable Long id) {
        managerService.deleteDish(id);
        return ResponseEntity.noContent().build();
    }

    // --- Tables & QR ---
    @GetMapping("/tables")
    public ResponseEntity<List<RestaurantTable>> getAllTables(@RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.ok(managerService.getAllTables(restaurantId));
    }

    @PostMapping("/tables")
    public ResponseEntity<RestaurantTable> createTable(@Valid @RequestBody TableRequestDto dto, @RequestParam(required = false) Long restaurantId) {
        return new ResponseEntity<>(managerService.createTable(dto, restaurantId), HttpStatus.CREATED);
    }

    @PostMapping("/tables/{id}/regenerate-qr")
    public ResponseEntity<RestaurantTable> regenerateQrToken(@PathVariable Long id) {
        return ResponseEntity.ok(managerService.regenerateQrToken(id));
    }

    @PutMapping("/tables/{id}")
    public ResponseEntity<RestaurantTable> updateTable(@PathVariable Long id, @Valid @RequestBody TableRequestDto dto) {
        return ResponseEntity.ok(managerService.updateTable(id, dto));
    }

    @DeleteMapping("/tables/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable Long id) {
        managerService.deleteTable(id);
        return ResponseEntity.noContent().build();
    }

    // --- Analytics & Orders ---
    @GetMapping("/analytics/dashboard")
    public ResponseEntity<SalesSummaryDto> getSalesSummary(@RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.ok(managerService.getSalesSummary(restaurantId));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponseDto>> getAllOrders(@RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.ok(managerService.getAllOrders(restaurantId));
    }
}
