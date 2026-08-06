package com.qr_restaurant.qr_restaurant_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "dishes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dish {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    private String imageUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private Boolean isAvailable;

    private Boolean isVeg;

    private Integer preparationTimeMinutes;

    @Column(columnDefinition = "TEXT")
    private String optionsJson; // Store customizable options e.g. ["Spicy", "Cold", "Extra Cheese"]

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isAvailable == null) {
            isAvailable = true;
        }
        if (preparationTimeMinutes == null) {
            preparationTimeMinutes = 15;
        }
        if (isVeg == null) {
            String lower = (name != null) ? name.toLowerCase() : "";
            boolean nonVeg = lower.contains("chicken") || lower.contains("prawn") || lower.contains("salmon") ||
                             lower.contains("burger") || lower.contains("steak") || lower.contains("beef") ||
                             lower.contains("meat") || lower.contains("fish") || lower.contains("pork") || lower.contains("bacon");
            isVeg = !nonVeg;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
