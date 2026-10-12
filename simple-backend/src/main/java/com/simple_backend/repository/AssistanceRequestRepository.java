package com.simple_backend.repository;

import com.simple_backend.model.AssistanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssistanceRequestRepository extends JpaRepository<AssistanceRequest, Long> {
    List<AssistanceRequest> findByIsResolvedFalseOrderByCreatedAtDesc();
    List<AssistanceRequest> findByRestaurantIdAndIsResolvedFalseOrderByCreatedAtDesc(Long restaurantId);
}
