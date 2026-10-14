package com.beofashion.dto;

import com.beofashion.entity.OrderType;
import com.beofashion.entity.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {
    @Builder.Default
    private OrderType orderType = OrderType.ONLINE_DELIVERY;

    private Long storeId; // If in-store pickup

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Customer phone is required")
    private String customerPhone;

    private String customerEmail;

    private String shippingAddress;
    private String shippingCity;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String couponCode;
    private String notes;

    // Optional direct items if checking out without database cart
    private List<CheckoutItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckoutItemRequest {
        private Long variantId;
        private Integer quantity;
    }
}
