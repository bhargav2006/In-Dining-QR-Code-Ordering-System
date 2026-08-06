package com.qr_restaurant.qr_restaurant_backend.service;

import com.qr_restaurant.qr_restaurant_backend.dto.*;
import com.qr_restaurant.qr_restaurant_backend.exception.BadRequestException;
import com.qr_restaurant.qr_restaurant_backend.exception.InvalidSessionException;
import com.qr_restaurant.qr_restaurant_backend.exception.ResourceNotFoundException;
import com.qr_restaurant.qr_restaurant_backend.model.*;
import com.qr_restaurant.qr_restaurant_backend.model.enums.*;
import com.qr_restaurant.qr_restaurant_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final RestaurantTableRepository tableRepository;
    private final TableSessionRepository sessionRepository;
    private final CategoryRepository categoryRepository;
    private final DishRepository dishRepository;
    private final OrderRepository orderRepository;
    private final AssistanceRequestRepository assistanceRequestRepository;

    @Transactional
    public TableScanResponseDto startOrGetSession(TableScanRequestDto request) {
        RestaurantTable table = null;

        if (request.getQrToken() != null && !request.getQrToken().isBlank()) {
            table = tableRepository.findByQrToken(request.getQrToken())
                    .orElseThrow(() -> new ResourceNotFoundException("Invalid QR Code Token"));
        } else if (request.getTableNumber() != null) {
            table = tableRepository.findByTableNumber(request.getTableNumber())
                    .orElseThrow(() -> new ResourceNotFoundException("Table #" + request.getTableNumber() + " not found"));
        } else {
            throw new BadRequestException("Provide either a QR token or table number");
        }

        // Check if there is an active session for this table
        java.util.Optional<TableSession> activeSessionOpt = sessionRepository.findByTableIdAndStatus(table.getId(), SessionStatus.ACTIVE);

        if (activeSessionOpt.isPresent()) {
            TableSession activeSession = activeSessionOpt.get();

            // Verify if caller provides matching session token
            boolean tokenMatches = request.getSessionToken() != null &&
                    request.getSessionToken().trim().equalsIgnoreCase(activeSession.getSessionToken().trim());

            if (!tokenMatches && (table.getStatus() == TableStatus.OCCUPIED || table.getStatus() == TableStatus.BILL_REQUESTED)) {
                // Table is currently occupied by another customer group - Lock access!
                return TableScanResponseDto.builder()
                        .tableId(table.getId())
                        .tableNumber(table.getTableNumber())
                        .capacity(table.getCapacity())
                        .tableStatus(table.getStatus())
                        .isOccupiedLocked(true)
                        .qrToken(table.getQrToken())
                        .build();
            }

            return TableScanResponseDto.builder()
                    .tableId(table.getId())
                    .tableNumber(table.getTableNumber())
                    .capacity(table.getCapacity())
                    .tableStatus(table.getStatus())
                    .sessionToken(activeSession.getSessionToken())
                    .isOccupiedLocked(false)
                    .qrToken(table.getQrToken())
                    .build();
        } else {
            // Table has no active session / free - Create new session & mark OCCUPIED
            table.setStatus(TableStatus.OCCUPIED);
            tableRepository.save(table);

            TableSession newSession = TableSession.builder()
                    .table(table)
                    .tableNumber(table.getTableNumber())
                    .sessionToken("SESS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .status(SessionStatus.ACTIVE)
                    .startTime(LocalDateTime.now())
                    .build();
            TableSession savedSession = sessionRepository.save(newSession);

            return TableScanResponseDto.builder()
                    .tableId(table.getId())
                    .tableNumber(table.getTableNumber())
                    .capacity(table.getCapacity())
                    .tableStatus(table.getStatus())
                    .sessionToken(savedSession.getSessionToken())
                    .isOccupiedLocked(false)
                    .qrToken(table.getQrToken())
                    .build();
        }
    }

    public List<Category> getActiveCategories() {
        return categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
    }

    public List<Dish> getAvailableDishes(Long categoryId, String search) {
        if (search != null && !search.isBlank()) {
            return dishRepository.findByNameContainingIgnoreCase(search).stream()
                    .filter(Dish::getIsAvailable)
                    .collect(Collectors.toList());
        }
        if (categoryId != null) {
            return dishRepository.findByCategoryIdAndIsAvailableTrue(categoryId);
        }
        return dishRepository.findByIsAvailableTrue();
    }

    @Transactional
    public OrderResponseDto createOrder(CreateOrderRequestDto request) {
        TableSession session = sessionRepository.findBySessionToken(request.getSessionToken())
                .orElseThrow(() -> new InvalidSessionException("Active table session not found or expired"));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new InvalidSessionException("Table session is no longer active");
        }

        // Server-side duplicate order prevention (idempotency check within last 5 seconds)
        List<Order> recentOrders = orderRepository.findByTableSessionIdOrderByCreatedAtDesc(session.getId());
        if (!recentOrders.isEmpty()) {
            Order latestOrder = recentOrders.get(0);
            if (latestOrder.getCreatedAt() != null && latestOrder.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(5))) {
                if (latestOrder.getItems().size() == request.getItems().size()) {
                    return mapToOrderResponseDto(latestOrder);
                }
            }
        }

        Order order = Order.builder()
                .orderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .tableSession(session)
                .tableNumber(session.getTableNumber())
                .status(OrderStatus.PLACED)
                .notes(request.getNotes())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItemDto itemDto : request.getItems()) {
            Dish dish = dishRepository.findById(itemDto.getDishId())
                    .orElseThrow(() -> new ResourceNotFoundException("Dish ID " + itemDto.getDishId() + " not found"));

            if (!dish.getIsAvailable()) {
                throw new BadRequestException("Dish '" + dish.getName() + "' is currently unavailable");
            }

            BigDecimal itemTotal = dish.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            OrderItem item = OrderItem.builder()
                    .dish(dish)
                    .dishName(dish.getName())
                    .unitPrice(dish.getPrice())
                    .quantity(itemDto.getQuantity())
                    .specialInstructions(itemDto.getSpecialInstructions())
                    .itemTotal(itemTotal)
                    .build();

            order.addItem(item);
        }

        BigDecimal taxRate = new BigDecimal("0.05"); // 5% tax
        BigDecimal tax = subtotal.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax).setScale(2, RoundingMode.HALF_UP);

        order.setTaxAmount(tax);
        order.setTotalAmount(total);

        Order savedOrder = orderRepository.save(order);
        return mapToOrderResponseDto(savedOrder);
    }

    public List<OrderResponseDto> getSessionOrders(String sessionToken) {
        TableSession session = sessionRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new InvalidSessionException("Session not found"));

        return orderRepository.findByTableSessionIdOrderByCreatedAtDesc(session.getId())
                .stream()
                .map(this::mapToOrderResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public BillReceiptDto generateBillReceipt(String sessionToken) {
        TableSession session = sessionRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new InvalidSessionException("Session not found"));

        List<Order> orders = orderRepository.findByTableSessionIdOrderByCreatedAtDesc(session.getId());

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItemResponseDto> allItems = new java.util.ArrayList<>();

        for (Order order : orders) {
            if (order.getStatus() != OrderStatus.CANCELLED) {
                for (OrderItem item : order.getItems()) {
                    subtotal = subtotal.add(item.getItemTotal());
                    allItems.add(OrderItemResponseDto.builder()
                            .id(item.getId())
                            .dishId(item.getDish().getId())
                            .dishName(item.getDishName())
                            .unitPrice(item.getUnitPrice())
                            .quantity(item.getQuantity())
                            .specialInstructions(item.getSpecialInstructions())
                            .itemTotal(item.getItemTotal())
                            .build());
                }
            }
        }

        BigDecimal taxRate = new BigDecimal("0.05");
        BigDecimal taxAmount = subtotal.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = subtotal.add(taxAmount).setScale(2, RoundingMode.HALF_UP);

        return BillReceiptDto.builder()
                .receiptNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .tableNumber(session.getTableNumber())
                .sessionToken(sessionToken)
                .items(allItems)
                .subtotal(subtotal)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .assignedWaiterMobile("+1 (555) 019-WAIT")
                .isPaid(session.getStatus() == SessionStatus.CLOSED)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Transactional
    public BillReceiptDto processCustomerPayment(CustomerPaymentDto paymentDto) {
        TableSession session = sessionRepository.findBySessionToken(paymentDto.getSessionToken())
                .orElseThrow(() -> new InvalidSessionException("Active session not found"));

        // Auto-cancel any orders still in PLACED status (not yet started cooking)
        List<Order> activeOrders = orderRepository.findByTableSessionIdOrderByCreatedAtDesc(session.getId());
        for (Order order : activeOrders) {
            if (order.getStatus() == OrderStatus.PLACED) {
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
            }
        }

        BillReceiptDto receipt = generateBillReceipt(paymentDto.getSessionToken());

        receipt.setCustomerName(paymentDto.getCustomerName());
        receipt.setPhoneNumber(paymentDto.getPhoneNumber());
        receipt.setEmail(paymentDto.getEmail());
        receipt.setRating(paymentDto.getRating());
        receipt.setReviewComments(paymentDto.getReviewComments());
        receipt.setPaymentMethod(paymentDto.getPaymentMethod());

        RestaurantTable table = session.getTable();

        if ("CASH".equalsIgnoreCase(paymentDto.getPaymentMethod())) {
            // Update table status to BILL_REQUESTED & trigger high-priority assistance alert
            table.setStatus(TableStatus.BILL_REQUESTED);
            tableRepository.save(table);

            AssistanceRequest request = AssistanceRequest.builder()
                    .tableSession(session)
                    .tableNumber(session.getTableNumber())
                    .requestType(AssistanceType.BILL_REQUEST)
                    .status(AssistanceStatus.PENDING)
                    .note("💰 CASH PAYMENT COLLECTION REQUEST. Customer: " +
                            (paymentDto.getCustomerName() != null ? paymentDto.getCustomerName() : "Diner") +
                            ". Waiter Hotline: +1 (555) 019-WAIT")
                    .build();
            assistanceRequestRepository.save(request);

            receipt.setIsPaid(false);
        } else {
            // Online Payment (CARD, UPI_QR): Complete payment & set table for cleaning
            List<Order> orders = orderRepository.findByTableSessionIdOrderByCreatedAtDesc(session.getId());
            for (Order order : orders) {
                if (order.getStatus() != OrderStatus.CANCELLED) {
                    order.setStatus(OrderStatus.COMPLETED);
                    orderRepository.save(order);
                }
            }

            session.setStatus(SessionStatus.CLOSED);
            session.setEndTime(LocalDateTime.now());
            sessionRepository.save(session);

            table.setStatus(TableStatus.AVAILABLE);
            tableRepository.save(table);

            receipt.setIsPaid(true);
        }

        return receipt;
    }

    @Transactional
    public AssistanceRequestDto requestAssistance(AssistanceRequestDto requestDto) {
        TableSession session = sessionRepository.findBySessionToken(requestDto.getSessionToken())
                .orElseThrow(() -> new InvalidSessionException("Active session not found"));

        if (requestDto.getRequestType() == AssistanceType.BILL_REQUEST) {
            RestaurantTable table = session.getTable();
            table.setStatus(TableStatus.BILL_REQUESTED);
            tableRepository.save(table);
        }

        AssistanceRequest request = AssistanceRequest.builder()
                .tableSession(session)
                .tableNumber(session.getTableNumber())
                .requestType(requestDto.getRequestType())
                .status(AssistanceStatus.PENDING)
                .note(requestDto.getNote())
                .build();

        AssistanceRequest saved = assistanceRequestRepository.save(request);

        return AssistanceRequestDto.builder()
                .id(saved.getId())
                .sessionToken(session.getSessionToken())
                .tableNumber(saved.getTableNumber())
                .requestType(saved.getRequestType())
                .status(saved.getStatus())
                .note(saved.getNote())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    public OrderResponseDto mapToOrderResponseDto(Order order) {
        List<OrderItemResponseDto> items = order.getItems().stream()
                .map(item -> OrderItemResponseDto.builder()
                        .id(item.getId())
                        .dishId(item.getDish().getId())
                        .dishName(item.getDishName())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .specialInstructions(item.getSpecialInstructions())
                        .itemTotal(item.getItemTotal())
                        .build())
                .collect(Collectors.toList());

        return OrderResponseDto.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .tableNumber(order.getTableNumber())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .taxAmount(order.getTaxAmount())
                .notes(order.getNotes())
                .items(items)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    @Transactional
    public OrderResponseDto cancelUncookedOrder(Long orderId, String sessionToken) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order ID " + orderId + " not found"));

        if (!order.getTableSession().getSessionToken().equals(sessionToken)) {
            throw new BadRequestException("Order does not belong to active table session");
        }

        if (order.getStatus() != OrderStatus.PLACED) {
            throw new BadRequestException("Cannot cancel order: Kitchen has already started preparing it!");
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);
        return mapToOrderResponseDto(saved);
    }
}
