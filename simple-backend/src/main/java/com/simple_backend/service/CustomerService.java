package com.simple_backend.service;

import com.simple_backend.model.*;
import com.simple_backend.model.enums.*;
import com.simple_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final RestaurantTableRepository tableRepository;
    private final TableSessionRepository sessionRepository;
    private final CategoryRepository categoryRepository;
    private final DishRepository dishRepository;
    private final OrderRepository orderRepository;
    private final AssistanceRequestRepository assistanceRepository;
    private final RestaurantRepository restaurantRepository;

    @Transactional
    public Map<String, Object> startSession(Map<String, Object> request) {
        Integer tableNumber = (Integer) request.get("tableNumber");
        String activeToken = (String) request.get("sessionToken");
        Long restaurantId = request.get("restaurantId") != null ? Long.valueOf(request.get("restaurantId").toString()) : null;
        String restaurantSlug = (String) request.get("restaurantSlug");

        RestaurantTable table;
        if (restaurantSlug != null && !restaurantSlug.isBlank()) {
            table = tableRepository.findByTableNumberAndRestaurantSlug(tableNumber, restaurantSlug)
                    .orElseGet(() -> tableRepository.findByTableNumber(tableNumber)
                    .orElseThrow(() -> new RuntimeException("Table " + tableNumber + " not found")));
        } else if (restaurantId != null) {
            table = tableRepository.findByTableNumberAndRestaurantId(tableNumber, restaurantId)
                    .orElseGet(() -> tableRepository.findByTableNumber(tableNumber)
                    .orElseThrow(() -> new RuntimeException("Table " + tableNumber + " not found")));
        } else {
            table = tableRepository.findByTableNumber(tableNumber)
                    .orElseThrow(() -> new RuntimeException("Table " + tableNumber + " not found"));
        }

        // Reuse active session if activeToken provided
        if (activeToken != null && !activeToken.isBlank()) {
            Optional<TableSession> existingSess = sessionRepository.findBySessionToken(activeToken);
            if (existingSess.isPresent() && existingSess.get().getStatus() == SessionStatus.ACTIVE
                    && existingSess.get().getTable().getId().equals(table.getId())) {
                TableSession sess = existingSess.get();
                Map<String, Object> res = new HashMap<>();
                res.put("sessionId", sess.getId());
                res.put("tableNumber", table.getTableNumber());
                res.put("sessionToken", sess.getSessionToken());
                res.put("restaurantId", table.getRestaurant() != null ? table.getRestaurant().getId() : null);
                res.put("restaurantName", table.getRestaurant() != null ? table.getRestaurant().getName() : "Gourmet Bistro");
                res.put("status", sess.getStatus());
                return res;
            }
        }

        Optional<TableSession> activeSession = sessionRepository.findByTableIdAndStatus(table.getId(), SessionStatus.ACTIVE);
        if (activeSession.isPresent()) {
            Map<String, Object> lockedRes = new HashMap<>();
            lockedRes.put("isOccupiedLocked", true);
            lockedRes.put("tableNumber", table.getTableNumber());
            lockedRes.put("restaurantName", table.getRestaurant() != null ? table.getRestaurant().getName() : "Gourmet Bistro");
            return lockedRes;
        }

        String newToken = "SESS-TBL-" + table.getTableNumber() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        TableSession newSession = TableSession.builder()
                .sessionToken(newToken)
                .table(table)
                .restaurant(table.getRestaurant())
                .status(SessionStatus.ACTIVE)
                .build();
        newSession = sessionRepository.save(newSession);

        table.setStatus(TableStatus.OCCUPIED);
        tableRepository.save(table);

        Map<String, Object> res = new HashMap<>();
        res.put("sessionId", newSession.getId());
        res.put("tableNumber", table.getTableNumber());
        res.put("sessionToken", newSession.getSessionToken());
        res.put("restaurantId", table.getRestaurant() != null ? table.getRestaurant().getId() : null);
        res.put("restaurantName", table.getRestaurant() != null ? table.getRestaurant().getName() : "Gourmet Bistro");
        res.put("status", newSession.getStatus());
        return res;
    }

    public List<Category> getCategories(Long restaurantId, String restaurantSlug) {
        if (restaurantSlug != null && !restaurantSlug.isBlank()) {
            return categoryRepository.findByRestaurantSlugAndIsActiveTrueOrderByDisplayOrderAsc(restaurantSlug);
        }
        if (restaurantId != null) {
            return categoryRepository.findByRestaurantIdAndIsActiveTrueOrderByDisplayOrderAsc(restaurantId);
        }
        return categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
    }

    public List<Dish> getMenu(Long categoryId, String search, Long restaurantId, String restaurantSlug) {
        if (restaurantSlug != null && !restaurantSlug.isBlank()) {
            if (categoryId != null) return dishRepository.findByRestaurantSlugAndCategoryIdAndIsAvailableTrue(restaurantSlug, categoryId);
            return dishRepository.findByRestaurantSlugAndIsAvailableTrue(restaurantSlug);
        }
        if (restaurantId != null) {
            if (categoryId != null) return dishRepository.findByRestaurantIdAndCategoryIdAndIsAvailableTrue(restaurantId, categoryId);
            return dishRepository.findByRestaurantIdAndIsAvailableTrue(restaurantId);
        }
        if (categoryId != null) return dishRepository.findByCategoryIdAndIsAvailableTrue(categoryId);
        if (search != null && !search.isBlank()) return dishRepository.findByNameContainingIgnoreCaseAndIsAvailableTrue(search);
        return dishRepository.findByIsAvailableTrue();
    }

    @Transactional
    public Map<String, Object> createOrder(Map<String, Object> request) {
        String sessionToken = (String) request.get("sessionToken");
        String notes = (String) request.get("notes");
        List<Map<String, Object>> itemsList = (List<Map<String, Object>>) request.get("items");

        TableSession session = sessionRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new RuntimeException("Active table session not found"));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new RuntimeException("Table session is closed");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = Order.builder()
                .orderNumber("ORD-" + System.currentTimeMillis() % 100000)
                .session(session)
                .restaurant(session.getRestaurant())
                .status(OrderStatus.PLACED)
                .notes(notes)
                .subtotal(BigDecimal.ZERO)
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .build();

        for (Map<String, Object> itemMap : itemsList) {
            Long dishId = Long.valueOf(itemMap.get("dishId").toString());
            Integer quantity = Integer.valueOf(itemMap.get("quantity").toString());
            String instructions = (String) itemMap.get("specialInstructions");

            Dish dish = dishRepository.findById(dishId)
                    .orElseThrow(() -> new RuntimeException("Dish not found"));

            BigDecimal lineTotal = dish.getPrice().multiply(new BigDecimal(quantity));
            subtotal = subtotal.add(lineTotal);

            orderItems.add(OrderItem.builder()
                    .order(order)
                    .dish(dish)
                    .quantity(quantity)
                    .pricePerUnit(dish.getPrice())
                    .totalPrice(lineTotal)
                    .specialInstructions(instructions)
                    .build());
        }

        BigDecimal tax = subtotal.multiply(new BigDecimal("0.05"));
        BigDecimal total = subtotal.add(tax);

        order.setSubtotal(subtotal);
        order.setTaxAmount(tax);
        order.setTotalAmount(total);
        order.setItems(orderItems);

        order = orderRepository.save(order);

        Map<String, Object> res = new HashMap<>();
        res.put("orderId", order.getId());
        res.put("orderNumber", order.getOrderNumber());
        res.put("status", order.getStatus());
        res.put("totalAmount", order.getTotalAmount());
        return res;
    }

    public List<Map<String, Object>> getSessionOrders(String sessionToken) {
        List<Order> orders = orderRepository.findBySessionSessionTokenOrderByCreatedAtDesc(sessionToken);
        List<Map<String, Object>> list = new ArrayList<>();
        for (Order o : orders) {
            Map<String, Object> m = new HashMap<>();
            m.put("orderId", o.getId());
            m.put("orderNumber", o.getOrderNumber());
            m.put("status", o.getStatus());
            m.put("tableNumber", o.getSession().getTable().getTableNumber());
            m.put("totalAmount", o.getTotalAmount());
            m.put("createdAt", o.getCreatedAt());

            List<Map<String, Object>> items = new ArrayList<>();
            for (OrderItem item : o.getItems()) {
                Map<String, Object> it = new HashMap<>();
                it.put("dishName", item.getDish().getName());
                it.put("quantity", item.getQuantity());
                it.put("price", item.getTotalPrice());
                items.add(it);
            }
            m.put("items", items);
            list.add(m);
        }
        return list;
    }

    public Map<String, Object> requestAssistance(Map<String, String> req) {
        String token = req.get("sessionToken");
        String note = req.get("note");
        String typeStr = req.get("requestType");

        TableSession session = sessionRepository.findBySessionToken(token)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        AssistanceType type = AssistanceType.WAITER_HELP;
        try { if (typeStr != null) type = AssistanceType.valueOf(typeStr); } catch (Exception ignored) {}

        AssistanceRequest request = AssistanceRequest.builder()
                .table(session.getTable())
                .session(session)
                .restaurant(session.getRestaurant())
                .requestType(type)
                .note(note)
                .isResolved(false)
                .build();
        assistanceRepository.save(request);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Assistance request dispatched to waiter");
        return res;
    }

    public Map<String, Object> getBillReceipt(String sessionToken) {
        TableSession session = sessionRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        List<Order> orders = orderRepository.findBySessionSessionTokenOrderByCreatedAtDesc(sessionToken);
        BigDecimal grandTotal = BigDecimal.ZERO;
        for (Order o : orders) grandTotal = grandTotal.add(o.getTotalAmount());

        Map<String, Object> res = new HashMap<>();
        res.put("tableNumber", session.getTable().getTableNumber());
        res.put("grandTotal", grandTotal);
        res.put("isPaid", session.getStatus() == SessionStatus.CLOSED);
        return res;
    }

    @Transactional
    public Map<String, Object> processPayment(Map<String, Object> req) {
        String token = (String) req.get("sessionToken");
        TableSession session = sessionRepository.findBySessionToken(token)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        session.setStatus(SessionStatus.CLOSED);
        sessionRepository.save(session);

        RestaurantTable table = session.getTable();
        table.setStatus(TableStatus.AVAILABLE);
        tableRepository.save(table);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Payment processed successfully");
        return res;
    }
}
