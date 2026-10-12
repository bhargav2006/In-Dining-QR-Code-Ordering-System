package com.simple_backend.controller;

import com.simple_backend.model.enums.OrderStatus;
import com.simple_backend.service.KitchenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kitchen")
@RequiredArgsConstructor
public class KitchenController {

    private final KitchenService kitchenService;

    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> getOrders(@RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.ok(kitchenService.getKitchenOrders(restaurantId));
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable Long orderId, @RequestParam OrderStatus status) {
        return ResponseEntity.ok(kitchenService.updateOrderStatus(orderId, status));
    }
}
