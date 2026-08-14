package com.uniqlo.clone.dto;

import com.uniqlo.clone.entity.OrderStatus;
import com.uniqlo.clone.entity.OrderType;
import com.uniqlo.clone.entity.PaymentMethod;
import com.uniqlo.clone.entity.PaymentStatus;
import com.uniqlo.clone.service.VietQrService.VietQrDetails;
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
public class OrderDto {
    private Long id;
    private String orderNumber;
    private Long userId;
    private Long storeId;
    private String storeName;
    private OrderType orderType;
    private OrderStatus status;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String shippingAddress;
    private String shippingCity;
    private String trackingNumber;
    private BigDecimal subTotal;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;
    private BigDecimal finalAmount;
    private String couponCode;
    private String notes;
    private PaymentInfoDto payment;
    private VietQrDetails vietQr;
    private List<OrderItemDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentInfoDto {
        private Long id;
        private PaymentMethod paymentMethod;
        private PaymentStatus paymentStatus;
        private String transactionId;
        private BigDecimal amount;
        private LocalDateTime paymentTime;
        private String paymentDetails;
        private String qrPaymentUrl;
    }
}
