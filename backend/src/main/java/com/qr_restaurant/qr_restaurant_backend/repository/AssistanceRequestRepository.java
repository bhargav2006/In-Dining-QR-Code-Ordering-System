package com.qr_restaurant.qr_restaurant_backend.repository;

import com.qr_restaurant.qr_restaurant_backend.model.AssistanceRequest;
import com.qr_restaurant.qr_restaurant_backend.model.enums.AssistanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssistanceRequestRepository extends JpaRepository<AssistanceRequest, Long> {
    List<AssistanceRequest> findByStatusOrderByCreatedAtDesc(AssistanceStatus status);
    List<AssistanceRequest> findByTableNumberAndStatus(Integer tableNumber, AssistanceStatus status);
    List<AssistanceRequest> findByTableSessionIdOrderByCreatedAtDesc(Long sessionId);
}
