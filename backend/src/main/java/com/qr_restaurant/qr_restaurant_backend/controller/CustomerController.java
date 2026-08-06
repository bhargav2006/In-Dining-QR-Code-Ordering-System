package com.qr_restaurant.qr_restaurant_backend.controller;

import com.qr_restaurant.qr_restaurant_backend.dto.*;
import com.qr_restaurant.qr_restaurant_backend.model.Category;
import com.qr_restaurant.qr_restaurant_backend.model.Dish;
import com.qr_restaurant.qr_restaurant_backend.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping("/session/start")
    public ResponseEntity<TableScanResponseDto> startOrGetSession(@RequestBody TableScanRequestDto request) {
        TableScanResponseDto response = customerService.startOrGetSession(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(customerService.getActiveCategories());
    }

    @GetMapping("/menu")
    public ResponseEntity<List<Dish>> getMenu(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(customerService.getAvailableDishes(categoryId, search));
    }

    @PostMapping("/orders")
    public ResponseEntity<OrderResponseDto> createOrder(@Valid @RequestBody CreateOrderRequestDto request) {
        OrderResponseDto response = customerService.createOrder(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/orders/session/{sessionToken}")
    public ResponseEntity<List<OrderResponseDto>> getSessionOrders(@PathVariable String sessionToken) {
        return ResponseEntity.ok(customerService.getSessionOrders(sessionToken));
    }

    @PostMapping("/assistance")
    public ResponseEntity<AssistanceRequestDto> requestAssistance(@Valid @RequestBody AssistanceRequestDto requestDto) {
        AssistanceRequestDto response = customerService.requestAssistance(requestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/bill/receipt/{sessionToken}")
    public ResponseEntity<BillReceiptDto> getBillReceipt(@PathVariable String sessionToken) {
        return ResponseEntity.ok(customerService.generateBillReceipt(sessionToken));
    }

    @PostMapping("/bill/pay")
    public ResponseEntity<BillReceiptDto> processPayment(@Valid @RequestBody CustomerPaymentDto paymentDto) {
        return ResponseEntity.ok(customerService.processCustomerPayment(paymentDto));
    }

    @DeleteMapping("/orders/{orderId}")
    public ResponseEntity<OrderResponseDto> cancelUncookedOrder(
            @PathVariable Long orderId,
            @RequestParam String sessionToken) {
        return ResponseEntity.ok(customerService.cancelUncookedOrder(orderId, sessionToken));
    }
}
