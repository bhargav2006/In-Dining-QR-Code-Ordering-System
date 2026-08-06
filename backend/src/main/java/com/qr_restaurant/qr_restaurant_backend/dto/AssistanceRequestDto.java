package com.qr_restaurant.qr_restaurant_backend.dto;

import com.qr_restaurant.qr_restaurant_backend.model.enums.AssistanceStatus;
import com.qr_restaurant.qr_restaurant_backend.model.enums.AssistanceType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssistanceRequestDto {
    private Long id;
    @NotNull
    private String sessionToken;
    private Integer tableNumber;
    @NotNull
    private AssistanceType requestType;
    private AssistanceStatus status;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
