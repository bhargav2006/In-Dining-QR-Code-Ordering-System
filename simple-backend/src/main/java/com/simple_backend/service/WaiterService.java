package com.simple_backend.service;

import com.simple_backend.model.*;
import com.simple_backend.model.enums.*;
import com.simple_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class WaiterService {

    private final RestaurantTableRepository tableRepository;
    private final TableSessionRepository sessionRepository;
    private final OrderRepository orderRepository;
    private final AssistanceRequestRepository assistanceRepository;

    public List<RestaurantTable> getTables(Long restaurantId) {
        List<RestaurantTable> list;
        if (restaurantId != null) {
            list = tableRepository.findByRestaurantIdOrderByTableNumberAsc(restaurantId);
        } else {
            list = tableRepository.findAll();
        }

        for (RestaurantTable table : list) {
            sessionRepository.findByTableIdAndStatus(table.getId(), SessionStatus.ACTIVE)
                    .ifPresent(sess -> table.setActiveSessionToken(sess.getSessionToken()));
        }
        return list;
    }

    public List<Map<String, Object>> getAssistanceRequests(Long restaurantId) {
        List<AssistanceRequest> requests;
        if (restaurantId != null) {
            requests = assistanceRepository.findByRestaurantIdAndIsResolvedFalseOrderByCreatedAtDesc(restaurantId);
        } else {
            requests = assistanceRepository.findByIsResolvedFalseOrderByCreatedAtDesc();
        }

        List<Map<String, Object>> res = new ArrayList<>();
        for (AssistanceRequest r : requests) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("tableNumber", r.getTable().getTableNumber());
            map.put("requestType", r.getRequestType());
            map.put("note", r.getNote());
            map.put("createdAt", r.getCreatedAt());
            res.add(map);
        }
        return res;
    }

    public List<Map<String, Object>> getReadyOrders(Long restaurantId) {
        List<Order> orders;
        if (restaurantId != null) {
            orders = orderRepository.findByRestaurantIdAndStatusOrderByCreatedAtAsc(restaurantId, OrderStatus.READY);
        } else {
            orders = orderRepository.findByStatusOrderByCreatedAtAsc(OrderStatus.READY);
        }

        List<Map<String, Object>> res = new ArrayList<>();
        for (Order o : orders) {
            Map<String, Object> map = new HashMap<>();
            map.put("orderId", o.getId());
            map.put("orderNumber", o.getOrderNumber());
            map.put("tableNumber", o.getSession().getTable().getTableNumber());
            map.put("status", o.getStatus());

            List<Map<String, Object>> items = new ArrayList<>();
            for (OrderItem it : o.getItems()) {
                Map<String, Object> i = new HashMap<>();
                i.put("dishName", it.getDish().getName());
                i.put("quantity", it.getQuantity());
                items.add(i);
            }
            map.put("items", items);
            res.add(map);
        }
        return res;
    }

    public Map<String, Object> resolveAssistance(Long requestId) {
        AssistanceRequest req = assistanceRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        req.setIsResolved(true);
        assistanceRepository.save(req);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        return res;
    }

    public Map<String, Object> markServed(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(OrderStatus.SERVED);
        orderRepository.save(order);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        return res;
    }

    public Map<String, Object> updateTableStatus(Long tableId, TableStatus status) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found"));

        table.setStatus(status);
        tableRepository.save(table);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        return res;
    }

    public Map<String, Object> checkoutTable(Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found"));

        sessionRepository.findByTableIdAndStatus(table.getId(), SessionStatus.ACTIVE)
                .ifPresent(sess -> {
                    sess.setStatus(SessionStatus.CLOSED);
                    sessionRepository.save(sess);
                });

        table.setStatus(TableStatus.AVAILABLE);
        tableRepository.save(table);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        return res;
    }
}
