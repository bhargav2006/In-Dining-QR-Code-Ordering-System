package com.simple_backend.controller;

import com.simple_backend.model.*;
import com.simple_backend.service.ManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
public class ManagerController {

    private final ManagerService managerService;

    @GetMapping("/analytics/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(@RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.ok(managerService.getDashboardStats(restaurantId));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories(@RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.ok(managerService.getCategories(restaurantId));
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> saveCategory(@RequestBody Category category, @RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.status(201).body(managerService.saveCategory(category, restaurantId));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category category, @RequestParam(required = false) Long restaurantId) {
        category.setId(id);
        return ResponseEntity.ok(managerService.saveCategory(category, restaurantId));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        managerService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dishes")
    public ResponseEntity<List<Dish>> getDishes(@RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.ok(managerService.getDishes(restaurantId));
    }

    @PostMapping("/dishes")
    public ResponseEntity<Dish> saveDish(@RequestBody Dish dish, @RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.status(201).body(managerService.saveDish(dish, restaurantId));
    }

    @PutMapping("/dishes/{id}")
    public ResponseEntity<Dish> updateDish(@PathVariable Long id, @RequestBody Dish dish, @RequestParam(required = false) Long restaurantId) {
        dish.setId(id);
        return ResponseEntity.ok(managerService.saveDish(dish, restaurantId));
    }

    @PatchMapping("/dishes/{id}/toggle-availability")
    public ResponseEntity<Dish> toggleAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(managerService.toggleDishAvailability(id));
    }

    @DeleteMapping("/dishes/{id}")
    public ResponseEntity<Void> deleteDish(@PathVariable Long id) {
        managerService.deleteDish(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tables")
    public ResponseEntity<List<RestaurantTable>> getTables(@RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.ok(managerService.getTables(restaurantId));
    }

    @PostMapping("/tables")
    public ResponseEntity<RestaurantTable> saveTable(@RequestBody RestaurantTable table, @RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.status(201).body(managerService.saveTable(table, restaurantId));
    }

    @PutMapping("/tables/{id}")
    public ResponseEntity<RestaurantTable> updateTable(@PathVariable Long id, @RequestBody RestaurantTable table, @RequestParam(required = false) Long restaurantId) {
        table.setId(id);
        return ResponseEntity.ok(managerService.saveTable(table, restaurantId));
    }

    @DeleteMapping("/tables/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable Long id) {
        managerService.deleteTable(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/tables/{id}/regenerate-qr")
    public ResponseEntity<RestaurantTable> regenerateQr(@PathVariable Long id) {
        RestaurantTable table = managerService.getTables(null).stream().filter(t -> t.getId().equals(id)).findFirst().orElseThrow();
        table.setQrToken(null);
        return ResponseEntity.ok(managerService.saveTable(table, null));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders(@RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.ok(managerService.getAllOrders(restaurantId));
    }
}
