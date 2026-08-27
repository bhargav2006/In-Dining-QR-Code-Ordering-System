package com.qr_restaurant.qr_restaurant_backend.dto;

import com.qr_restaurant.qr_restaurant_backend.model.enums.TableStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableScanResponseDto {
    private Long tableId;
    private Integer tableNumber;
    private Integer capacity;
    private TableStatus tableStatus;
    private String sessionToken;
    private String qrToken;
    private Boolean isOccupiedLocked;

    private Long restaurantId;
    private String restaurantName;
    private String restaurantSlug;
    private String restaurantLogoUrl;
}
