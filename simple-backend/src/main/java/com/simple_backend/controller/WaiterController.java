package com.simple_backend.controller;

import com.simple_backend.model.RestaurantTable;
import com.simple_backend.model.enums.TableStatus;
import com.simple_backend.service.WaiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/waiter")
@RequiredArgsConstructor
public class WaiterController {

    private final WaiterService waiterService;

    @GetMapping("/tables")
    public ResponseEntity<List<RestaurantTable>> getTables(@RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.ok(waiterService.getTables(restaurantId));
    }

    @GetMapping("/assistance")
    public ResponseEntity<List<Map<String, Object>>> getAssistanceRequests(@RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.ok(waiterService.getAssistanceRequests(restaurantId));
    }

    @GetMapping("/orders/ready")
    public ResponseEntity<List<Map<String, Object>>> getReadyOrders(@RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.ok(waiterService.getReadyOrders(restaurantId));
    }

    @PatchMapping("/assistance/{requestId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveAssistance(@PathVariable Long requestId) {
        return ResponseEntity.ok(waiterService.resolveAssistance(requestId));
    }

    @PatchMapping("/orders/{orderId}/serve")
    public ResponseEntity<Map<String, Object>> markServed(@PathVariable Long orderId) {
        return ResponseEntity.ok(waiterService.markServed(orderId));
    }

    @PatchMapping("/tables/{tableId}/status")
    public ResponseEntity<Map<String, Object>> updateTableStatus(@PathVariable Long tableId, @RequestParam TableStatus status) {
        return ResponseEntity.ok(waiterService.updateTableStatus(tableId, status));
    }

    @PostMapping("/tables/{tableId}/checkout")
    public ResponseEntity<Map<String, Object>> checkoutTable(@PathVariable Long tableId) {
        return ResponseEntity.ok(waiterService.checkoutTable(tableId));
    }
}
