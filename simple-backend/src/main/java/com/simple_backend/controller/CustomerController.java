package com.simple_backend.controller;

import com.simple_backend.model.Category;
import com.simple_backend.model.Dish;
import com.simple_backend.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping("/session/start")
    public ResponseEntity<Map<String, Object>> startSession(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(customerService.startSession(request));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories(
            @RequestParam(required = false) Long restaurantId,
            @RequestParam(required = false) String restaurantSlug) {
        return ResponseEntity.ok(customerService.getCategories(restaurantId, restaurantSlug));
    }

    @GetMapping("/menu")
    public ResponseEntity<List<Dish>> getMenu(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long restaurantId,
            @RequestParam(required = false) String restaurantSlug) {
        return ResponseEntity.ok(customerService.getMenu(categoryId, search, restaurantId, restaurantSlug));
    }

    @PostMapping("/orders")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> request) {
        return ResponseEntity.status(201).body(customerService.createOrder(request));
    }

    @GetMapping("/orders/session/{sessionToken}")
    public ResponseEntity<List<Map<String, Object>>> getSessionOrders(@PathVariable String sessionToken) {
        return ResponseEntity.ok(customerService.getSessionOrders(sessionToken));
    }

    @PostMapping("/assistance")
    public ResponseEntity<Map<String, Object>> requestAssistance(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(customerService.requestAssistance(request));
    }

    @GetMapping("/bill/receipt/{sessionToken}")
    public ResponseEntity<Map<String, Object>> getBillReceipt(@PathVariable String sessionToken) {
        return ResponseEntity.ok(customerService.getBillReceipt(sessionToken));
    }

    @PostMapping("/bill/pay")
    public ResponseEntity<Map<String, Object>> processPayment(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(customerService.processPayment(request));
    }
}
