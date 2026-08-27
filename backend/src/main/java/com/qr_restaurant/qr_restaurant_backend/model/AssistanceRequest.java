package com.qr_restaurant.qr_restaurant_backend.model;

import com.qr_restaurant.qr_restaurant_backend.model.enums.AssistanceStatus;
import com.qr_restaurant.qr_restaurant_backend.model.enums.AssistanceType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "assistance_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssistanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private TableSession tableSession;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @Column(nullable = false)
    private Integer tableNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssistanceType requestType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssistanceStatus status;

    private String note;

    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = AssistanceStatus.PENDING;
        }
    }
}
