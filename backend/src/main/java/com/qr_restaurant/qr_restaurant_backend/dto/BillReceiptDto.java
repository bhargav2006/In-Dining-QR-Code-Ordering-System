package com.qr_restaurant.qr_restaurant_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillReceiptDto {
    private String receiptNumber;
    private Integer tableNumber;
    private String sessionToken;
    private List<OrderItemResponseDto> items;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;

    private String customerName;
    private String phoneNumber;
    private String email;

    private Integer rating;
    private String reviewComments;
    private String paymentMethod;
    private String assignedWaiterMobile;
    private Boolean isPaid;

    private LocalDateTime createdAt;
}
