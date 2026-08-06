package com.qr_restaurant.qr_restaurant_backend.controller;

import com.qr_restaurant.qr_restaurant_backend.dto.AssistanceRequestDto;
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
    public ResponseEntity<List<RestaurantTable>> getAllTables() {
        return ResponseEntity.ok(waiterService.getAllTables());
    }

    @PatchMapping("/tables/{tableId}/status")
    public ResponseEntity<RestaurantTable> updateTableStatus(
            @PathVariable Long tableId,
            @RequestParam TableStatus status) {
        return ResponseEntity.ok(waiterService.updateTableStatus(tableId, status));
    }

    @GetMapping("/assistance")
    public ResponseEntity<List<AssistanceRequestDto>> getPendingAssistanceRequests() {
        return ResponseEntity.ok(waiterService.getPendingAssistanceRequests());
    }

    @PatchMapping("/assistance/{requestId}/resolve")
    public ResponseEntity<AssistanceRequestDto> resolveAssistanceRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(waiterService.resolveAssistanceRequest(requestId));
    }

    @GetMapping("/orders/ready")
    public ResponseEntity<List<com.qr_restaurant.qr_restaurant_backend.dto.OrderResponseDto>> getReadyToServeOrders() {
        return ResponseEntity.ok(waiterService.getReadyToServeOrders());
    }

    @PatchMapping("/orders/{orderId}/serve")
    public ResponseEntity<com.qr_restaurant.qr_restaurant_backend.dto.OrderResponseDto> markOrderServed(@PathVariable Long orderId) {
        return ResponseEntity.ok(waiterService.markOrderServed(orderId));
    }

    @PostMapping("/tables/{tableId}/checkout")
    public ResponseEntity<TableSession> checkoutAndLiberateTable(@PathVariable Long tableId) {
        return ResponseEntity.ok(waiterService.checkoutAndLiberateTable(tableId));
    }
}
