package com.qr_restaurant.qr_restaurant_backend.service;

import com.qr_restaurant.qr_restaurant_backend.dto.AssistanceRequestDto;
import com.qr_restaurant.qr_restaurant_backend.dto.OrderResponseDto;
import com.qr_restaurant.qr_restaurant_backend.exception.BadRequestException;
import com.qr_restaurant.qr_restaurant_backend.exception.ResourceNotFoundException;
import com.qr_restaurant.qr_restaurant_backend.model.*;
import com.qr_restaurant.qr_restaurant_backend.model.enums.AssistanceStatus;
import com.qr_restaurant.qr_restaurant_backend.model.enums.OrderStatus;
import com.qr_restaurant.qr_restaurant_backend.model.enums.SessionStatus;
import com.qr_restaurant.qr_restaurant_backend.model.enums.TableStatus;
import com.qr_restaurant.qr_restaurant_backend.repository.*;
import com.qr_restaurant.qr_restaurant_backend.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WaiterService {

    private final RestaurantTableRepository tableRepository;
    private final TableSessionRepository sessionRepository;
    private final AssistanceRequestRepository assistanceRequestRepository;
    private final OrderRepository orderRepository;
    private final CustomerService customerService;

    public List<RestaurantTable> getAllTables() {
        Long targetRestId = SecurityUtil.getRequiredRestaurantId();
        List<RestaurantTable> tables = tableRepository.findByRestaurantIdOrderByTableNumberAsc(targetRestId);

        for (RestaurantTable table : tables) {
            TableSession activeSession = sessionRepository.findByTableIdAndStatus(table.getId(), SessionStatus.ACTIVE).orElse(null);
            if (activeSession != null) {
                table.setActiveSessionToken(activeSession.getSessionToken());
            }
        }
        return tables;
    }

    public List<RestaurantTable> getAllTables(Long ignoredRestaurantId) {
        return getAllTables();
    }

    public List<AssistanceRequestDto> getPendingAssistanceRequests() {
        Long targetRestId = SecurityUtil.getRequiredRestaurantId();
        List<AssistanceRequest> requests = assistanceRequestRepository.findByRestaurantIdAndStatusOrderByCreatedAtDesc(targetRestId, AssistanceStatus.PENDING);

        return requests.stream()
                .map(req -> AssistanceRequestDto.builder()
                        .id(req.getId())
                        .sessionToken(req.getTableSession() != null ? req.getTableSession().getSessionToken() : null)
                        .tableNumber(req.getTableNumber())
                        .requestType(req.getRequestType())
                        .status(req.getStatus())
                        .note(req.getNote())
                        .createdAt(req.getCreatedAt())
                        .resolvedAt(req.getResolvedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public List<AssistanceRequestDto> getPendingAssistanceRequests(Long ignoredRestaurantId) {
        return getPendingAssistanceRequests();
    }

    @Transactional
    public AssistanceRequestDto resolveAssistanceRequest(Long requestId) {
        Long targetRestId = SecurityUtil.getRequiredRestaurantId();
        AssistanceRequest request = assistanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Assistance request ID " + requestId + " not found"));

        if (request.getRestaurant() == null || !request.getRestaurant().getId().equals(targetRestId)) {
            throw new BadRequestException("Assistance request ID " + requestId + " does not belong to your restaurant");
        }

        request.setStatus(AssistanceStatus.RESOLVED);
        request.setResolvedAt(LocalDateTime.now());

        // If resolving a Cash Payment / Bill Request, mark session closed and completed
        if (request.getRequestType() == com.qr_restaurant.qr_restaurant_backend.model.enums.AssistanceType.BILL_REQUEST && request.getTableSession() != null) {
            TableSession session = request.getTableSession();
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

            RestaurantTable table = session.getTable();
            if (table != null) {
                table.setStatus(TableStatus.AVAILABLE);
                tableRepository.save(table);
            }
        }

        AssistanceRequest saved = assistanceRequestRepository.save(request);

        return AssistanceRequestDto.builder()
                .id(saved.getId())
                .tableNumber(saved.getTableNumber())
                .requestType(saved.getRequestType())
                .status(saved.getStatus())
                .note(saved.getNote())
                .createdAt(saved.getCreatedAt())
                .resolvedAt(saved.getResolvedAt())
                .build();
    }

    @Transactional
    public RestaurantTable updateTableStatus(Long tableId, TableStatus status) {
        Long targetRestId = SecurityUtil.getRequiredRestaurantId();
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table ID " + tableId + " not found"));

        if (table.getRestaurant() == null || !table.getRestaurant().getId().equals(targetRestId)) {
            throw new BadRequestException("Table ID " + tableId + " does not belong to your restaurant");
        }

        table.setStatus(status);

        if (status == TableStatus.OCCUPIED || status == TableStatus.BILL_REQUESTED) {
            TableSession activeSession = sessionRepository.findByTableIdAndStatus(tableId, SessionStatus.ACTIVE).orElse(null);
            if (activeSession == null) {
                activeSession = TableSession.builder()
                        .table(table)
                        .tableNumber(table.getTableNumber())
                        .sessionToken("SESS-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                        .status(SessionStatus.ACTIVE)
                        .startTime(LocalDateTime.now())
                        .restaurant(table.getRestaurant())
                        .build();
                activeSession = sessionRepository.save(activeSession);
            }
            table.setActiveSessionToken(activeSession.getSessionToken());
        } else if (status == TableStatus.AVAILABLE || status == TableStatus.CLEANING_NEEDED) {
            List<TableSession> activeSessions = sessionRepository.findAllByTableIdAndStatusOrderByStartTimeDesc(tableId, SessionStatus.ACTIVE);
            for (TableSession sess : activeSessions) {
                sess.setStatus(SessionStatus.CLOSED);
                sess.setEndTime(LocalDateTime.now());
                sessionRepository.save(sess);
            }
        }

        RestaurantTable saved = tableRepository.save(table);

        TableSession sess = sessionRepository.findByTableIdAndStatus(tableId, SessionStatus.ACTIVE).orElse(null);
        if (sess != null) {
            saved.setActiveSessionToken(sess.getSessionToken());
        }
        return saved;
    }

    public List<OrderResponseDto> getReadyToServeOrders() {
        Long targetRestId = SecurityUtil.getRequiredRestaurantId();
        List<Order> orders = orderRepository.findByRestaurantIdAndStatusOrderByCreatedAtDesc(targetRestId, OrderStatus.READY);

        return orders.stream()
                .map(customerService::mapToOrderResponseDto)
                .collect(Collectors.toList());
    }

    public List<OrderResponseDto> getReadyToServeOrders(Long ignoredRestaurantId) {
        return getReadyToServeOrders();
    }

    @Transactional
    public OrderResponseDto markOrderServed(Long orderId) {
        Long targetRestId = SecurityUtil.getRequiredRestaurantId();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order ID " + orderId + " not found"));

        if (order.getRestaurant() == null || !order.getRestaurant().getId().equals(targetRestId)) {
            throw new BadRequestException("Order ID " + orderId + " does not belong to your restaurant");
        }

        order.setStatus(OrderStatus.SERVED);
        Order saved = orderRepository.save(order);
        return customerService.mapToOrderResponseDto(saved);
    }

    @Transactional
    public TableSession checkoutAndLiberateTable(Long tableId) {
        Long targetRestId = SecurityUtil.getRequiredRestaurantId();
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table ID " + tableId + " not found"));

        if (table.getRestaurant() == null || !table.getRestaurant().getId().equals(targetRestId)) {
            throw new BadRequestException("Table ID " + tableId + " does not belong to your restaurant");
        }

        List<TableSession> activeSessions = sessionRepository.findAllByTableIdAndStatusOrderByStartTimeDesc(tableId, SessionStatus.ACTIVE);
        TableSession primarySession = activeSessions.isEmpty() ? null : activeSessions.get(0);

        for (TableSession session : activeSessions) {
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
        }

        table.setStatus(TableStatus.AVAILABLE);
        tableRepository.save(table);

        return primarySession;
    }
}
