package com.uniqlo.clone.controller;

import com.uniqlo.clone.dto.ApiResponse;
import com.uniqlo.clone.dto.OrderDto;
import com.uniqlo.clone.entity.Order;
import com.uniqlo.clone.entity.OrderStatus;
import com.uniqlo.clone.entity.Payment;
import com.uniqlo.clone.entity.PaymentStatus;
import com.uniqlo.clone.exception.ResourceNotFoundException;
import com.uniqlo.clone.repository.OrderRepository;
import com.uniqlo.clone.repository.PaymentRepository;
import com.uniqlo.clone.service.OrderService;
import com.uniqlo.clone.service.VietQrService;
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
@Tag(name = "Payments & VietQR", description = "Endpoints for VietQR payment generation, status polling, simulated webhooks and bank configuration")
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

    @PostMapping("/vietqr/simulate-transfer")
    @Transactional
    @Operation(summary = "Simulate a bank transfer transaction (Simulates SePay/Casso/Bank webhook)")
    public ResponseEntity<ApiResponse<OrderDto>> simulateBankTransfer(@RequestBody SimulateTransferRequest request) {
        Order order = orderRepository.findByOrderNumber(request.getOrderNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + request.getOrderNumber()));

        Payment payment = order.getPayment();
        if (payment == null) {
            payment = Payment.builder()
                    .order(order)
                    .paymentMethod(order.getPayment() != null ? order.getPayment().getPaymentMethod() : com.uniqlo.clone.entity.PaymentMethod.BANK_TRANSFER)
                    .amount(order.getFinalAmount())
                    .build();
        }

        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setPaymentTime(LocalDateTime.now());
        payment.setTransactionId(request.getTransactionRef() != null && !request.getTransactionRef().isBlank() ?
                request.getTransactionRef() : "SEPAY-" + System.currentTimeMillis());
        payment.setPaymentDetails("Simulated bank transfer via VietQR. Content: Thanh toan don hang " + order.getOrderNumber());

        paymentRepository.save(payment);
        order.setPayment(payment);

        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
        }

        order = orderRepository.save(order);

        return ResponseEntity.ok(ApiResponse.<OrderDto>builder()
                .success(true)
                .message("Simulated bank transfer received successfully. Order is now CONFIRMED!")
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
    public static class SimulateTransferRequest {
        private String orderNumber;
        private String transactionRef;
        private BigDecimal amount;
    }
}
