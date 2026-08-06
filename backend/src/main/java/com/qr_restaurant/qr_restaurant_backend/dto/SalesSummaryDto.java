package com.qr_restaurant.qr_restaurant_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesSummaryDto {
    private BigDecimal todaySales;
    private Long todayOrdersCount;
    private BigDecimal yesterdaySales;
    private Long yesterdayOrdersCount;
    private BigDecimal allTimeSales;
    private Long allTimeOrdersCount;
    private Long activeTablesCount;
    private Long totalTablesCount;
    private Long pendingOrdersCount;
}
