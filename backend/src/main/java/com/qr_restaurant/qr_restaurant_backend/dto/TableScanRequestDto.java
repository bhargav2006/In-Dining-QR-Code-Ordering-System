package com.qr_restaurant.qr_restaurant_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableScanRequestDto {
    private String qrToken;
    private Integer tableNumber;
    private Long restaurantId;
    private String restaurantSlug;
    private String sessionToken;
}
