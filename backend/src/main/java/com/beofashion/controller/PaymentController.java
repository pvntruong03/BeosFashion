package com.beofashion.controller;

import com.beofashion.dto.ApiResponse;
import com.beofashion.dto.OrderDto;
import com.beofashion.entity.Order;
import com.beofashion.entity.OrderStatus;
import com.beofashion.entity.Payment;
import com.beofashion.entity.PaymentMethod;
import com.beofashion.entity.PaymentStatus;
import com.beofashion.exception.ResourceNotFoundException;
import com.beofashion.repository.OrderRepository;
import com.beofashion.repository.PaymentRepository;
import com.beofashion.service.OrderService;
import com.beofashion.service.VietQrService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments & VietQR", description = "Endpoints for VietQR payment generation, status polling, transfer confirmation, and bank configuration")
public class PaymentController {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final OrderService orderService;
    private final VietQrService vietQrService;

    @GetMapping("/vietqr/{orderNumber}/status")
    @Operation(summary = "Check payment status for an order (used by frontend polling)")
    public ResponseEntity<PaymentStatusResponse> checkPaymentStatus(@PathVariable String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderNumber));

        Payment payment = order.getPayment();
        PaymentStatus status = payment != null ? payment.getPaymentStatus() : PaymentStatus.PENDING;

        return ResponseEntity.ok(PaymentStatusResponse.builder()
                .orderNumber(order.getOrderNumber())
                .orderStatus(order.getStatus())
                .paymentStatus(status)
                .isPaid(status == PaymentStatus.SUCCESS)
                .amount(order.getFinalAmount())
                .transactionId(payment != null ? payment.getTransactionId() : null)
                .paymentTime(payment != null ? payment.getPaymentTime() : null)
                .build());
    }

    @PostMapping("/vietqr/confirm-transfer")
    @Transactional
    @Operation(summary = "Confirm a VietQR/bank transfer payment after customer has transferred")
    public ResponseEntity<ApiResponse<OrderDto>> confirmBankTransfer(@RequestBody ConfirmTransferRequest request) {
        Order order = orderRepository.findByOrderNumber(request.getOrderNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + request.getOrderNumber()));

        Payment payment = order.getPayment();
        if (payment == null || (payment.getPaymentMethod() != PaymentMethod.BANK_TRANSFER
                && payment.getPaymentMethod() != PaymentMethod.VIETQR)) {
            throw new IllegalArgumentException("Transfer confirmation is only available for VietQR or bank transfer orders");
        }

        if (request.getAmount() != null && request.getAmount().compareTo(order.getFinalAmount()) != 0) {
            throw new IllegalArgumentException("Payment amount must match the order total");
        }

        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setPaymentTime(LocalDateTime.now());
        payment.setTransactionId(request.getTransactionRef() == null || request.getTransactionRef().isBlank()
                ? "VQR-" + System.currentTimeMillis()
                : request.getTransactionRef());
        payment.setPaymentDetails("Customer confirmed VietQR/bank transfer for order " + order.getOrderNumber());

        paymentRepository.save(payment);
        order.setPayment(payment);
        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
        }
        order = orderRepository.save(order);

        return ResponseEntity.ok(ApiResponse.<OrderDto>builder()
                .success(true)
                .message("Bank transfer payment confirmed")
                .data(orderService.mapToDto(order))
                .build());
    }

    @GetMapping("/vietqr/config")
    @Operation(summary = "Get receiving bank account configuration")
    public ResponseEntity<VietQrService.BankConfig> getBankConfig() {
        return ResponseEntity.ok(vietQrService.getBankConfig());
    }

    @PutMapping("/vietqr/config")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update receiving bank account configuration (Admin only)")
    public ResponseEntity<ApiResponse<VietQrService.BankConfig>> updateBankConfig(@RequestBody VietQrService.BankConfig config) {
        vietQrService.updateBankConfig(config);
        return ResponseEntity.ok(ApiResponse.<VietQrService.BankConfig>builder()
                .success(true)
                .message("Receiving bank configuration updated successfully")
                .data(vietQrService.getBankConfig())
                .build());
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentStatusResponse {
        private String orderNumber;
        private OrderStatus orderStatus;
        private PaymentStatus paymentStatus;
        private boolean isPaid;
        private BigDecimal amount;
        private String transactionId;
        private LocalDateTime paymentTime;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConfirmTransferRequest {
        private String orderNumber;
        private String transactionRef;
        private BigDecimal amount;
    }
}
