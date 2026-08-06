package com.qr_restaurant.qr_restaurant_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerPaymentDto {

    @NotBlank(message = "Session token is required")
    @Size(max = 100, message = "Session token too long")
    private String sessionToken;

    @Size(max = 100, message = "Customer name max 100 characters")
    private String customerName;

    @Size(max = 20, message = "Phone number max 20 characters")
    private String phoneNumber;

    @Email(message = "Invalid email address format")
    @Size(max = 100, message = "Email max 100 characters")
    private String email;

    @Min(value = 1, message = "Rating must be at least 1 star")
    @Max(value = 5, message = "Rating cannot exceed 5 stars")
    private Integer rating; // 1 - 5 stars

    @Size(max = 500, message = "Review comments max 500 characters")
    private String reviewComments;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // CARD, UPI_QR, CASH

    @Size(max = 25, message = "Assigned waiter mobile max 25 characters")
    private String assignedWaiterMobile;
}
