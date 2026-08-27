package com.qr_restaurant.qr_restaurant_backend.controller;

import com.qr_restaurant.qr_restaurant_backend.dto.AssistanceRequestDto;
import com.qr_restaurant.qr_restaurant_backend.dto.OrderResponseDto;
import com.qr_restaurant.qr_restaurant_backend.model.RestaurantTable;
import com.qr_restaurant.qr_restaurant_backend.model.TableSession;
import com.qr_restaurant.qr_restaurant_backend.model.enums.TableStatus;
import com.qr_restaurant.qr_restaurant_backend.service.WaiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waiter")
@RequiredArgsConstructor
public class WaiterController {

    private final WaiterService waiterService;

    @GetMapping("/tables")
    public ResponseEntity<List<RestaurantTable>> getAllTables(@RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.ok(waiterService.getAllTables(restaurantId));
    }

    @PatchMapping("/tables/{tableId}/status")
    public ResponseEntity<RestaurantTable> updateTableStatus(
            @PathVariable Long tableId,
            @RequestParam TableStatus status) {
        return ResponseEntity.ok(waiterService.updateTableStatus(tableId, status));
    }

    @GetMapping("/assistance")
    public ResponseEntity<List<AssistanceRequestDto>> getPendingAssistanceRequests(@RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.ok(waiterService.getPendingAssistanceRequests(restaurantId));
    }

    @PatchMapping("/assistance/{requestId}/resolve")
    public ResponseEntity<AssistanceRequestDto> resolveAssistanceRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(waiterService.resolveAssistanceRequest(requestId));
    }

    @GetMapping("/orders/ready")
    public ResponseEntity<List<OrderResponseDto>> getReadyToServeOrders(@RequestParam(required = false) Long restaurantId) {
        return ResponseEntity.ok(waiterService.getReadyToServeOrders(restaurantId));
    }

    @PatchMapping("/orders/{orderId}/serve")
    public ResponseEntity<OrderResponseDto> markOrderServed(@PathVariable Long orderId) {
        return ResponseEntity.ok(waiterService.markOrderServed(orderId));
    }

    @PostMapping("/tables/{tableId}/checkout")
    public ResponseEntity<TableSession> checkoutAndLiberateTable(@PathVariable Long tableId) {
        return ResponseEntity.ok(waiterService.checkoutAndLiberateTable(tableId));
    }
}
