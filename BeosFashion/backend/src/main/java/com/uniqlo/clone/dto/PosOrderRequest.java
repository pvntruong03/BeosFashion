package com.uniqlo.clone.dto;

import com.uniqlo.clone.entity.PaymentMethod;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PosOrderRequest {
    private Long storeId;
    private String customerPhone;
    private String customerName;
    private String couponCode;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private BigDecimal cashTendered; // Amount given by customer in cash
    private String notes;

    @NotEmpty(message = "Order must have at least one item")
    private List<PosItem> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PosItem {
        private Long variantId;
        private Integer quantity;
        private BigDecimal customPrice;
    }
}
