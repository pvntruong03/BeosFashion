package com.beofashion.controller;

import com.beofashion.dto.ApiResponse;
import com.beofashion.entity.Order;
import com.beofashion.entity.OrderStatus;
import com.beofashion.entity.Payment;
import com.beofashion.entity.PaymentMethod;
import com.beofashion.entity.PaymentStatus;
import com.beofashion.exception.ResourceNotFoundException;
import com.beofashion.repository.OrderRepository;
import com.beofashion.repository.PaymentRepository;
import com.beofashion.service.OrderPaymentEmailService;
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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.security.MessageDigest;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments & VietQR", description = "Endpoints for VietQR payment generation, status polling, transfer confirmation, and bank configuration")
public class PaymentController {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final VietQrService vietQrService;
    private final OrderPaymentEmailService orderPaymentEmailService;

    @Value("${app.payment.sepay.webhook-api-key:}")
    private String sePayWebhookApiKey;

    private static final Pattern ORDER_NUMBER_PATTERN = Pattern.compile("\\b(BEO-[A-Z0-9]+-[A-Z0-9]+)\\b");
    // BIDV/SePay transfer descriptions can remove punctuation, for example
    // BEO-261014-EE67F arrives as BEO261014EE67F.
    private static final Pattern COMPACT_ORDER_NUMBER_PATTERN = Pattern.compile("\\bBEO(\\d{6})([A-Z0-9]{5})\\b");

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

    @PostMapping("/sepay/webhook")
    @Transactional
    @Operation(summary = "Receive a verified SePay incoming-transfer webhook")
    public ResponseEntity<Map<String, Boolean>> handleSePayWebhook(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody SePayWebhookRequest request) {
        verifySePayAuthorization(authorization);

        if (request.getId() == null || request.getTransferAmount() == null || request.getTransferAmount().signum() <= 0) {
            throw new IllegalArgumentException("SePay webhook is missing a valid transaction id or amount");
        }
        if (!"in".equalsIgnoreCase(request.getTransferType())) {
            throw new IllegalArgumentException("Only incoming SePay transfers can settle an order");
        }

        String transactionId = "SEPAY-" + request.getId();
        Optional<Payment> existingPayment = paymentRepository.findByTransactionId(transactionId);
        if (existingPayment.isPresent()) {
            return ResponseEntity.ok(Map.of("success", true));
        }

        String orderNumber = extractOrderNumber(request.getCode(), request.getContent());
        if (orderNumber == null) {
            throw new IllegalArgumentException("SePay transfer does not contain a BEO order number");
        }

        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderNumber));

        Payment payment = order.getPayment();
        if (payment == null || (payment.getPaymentMethod() != PaymentMethod.BANK_TRANSFER
                && payment.getPaymentMethod() != PaymentMethod.VIETQR)) {
            throw new IllegalArgumentException("Transfer confirmation is only available for VietQR or bank transfer orders");
        }

        if (request.getTransferAmount().compareTo(order.getFinalAmount()) != 0) {
            throw new IllegalArgumentException("SePay payment amount must match the order total");
        }

        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setPaymentTime(LocalDateTime.now());
        payment.setTransactionId(transactionId);
        payment.setPaymentDetails("SePay transaction " + request.getReferenceCode() + " confirmed for order " + order.getOrderNumber());

        paymentRepository.save(payment);
        order.setPayment(payment);
        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
        }
        order = orderRepository.save(order);

        orderPaymentEmailService.sendPaidOrderEmail(order);
        return ResponseEntity.ok(Map.of("success", true));
    }

    private void verifySePayAuthorization(String authorization) {
        if (sePayWebhookApiKey == null || sePayWebhookApiKey.isBlank()) {
            throw new IllegalStateException("SePay webhook is not configured");
        }
        String expected = "Apikey " + sePayWebhookApiKey;
        if (authorization == null || !MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8), authorization.getBytes(StandardCharsets.UTF_8))) {
            throw new AccessDeniedException("Invalid SePay webhook authorization");
        }
    }

    private String extractOrderNumber(String code, String content) {
        String source = String.join(" ", code == null ? "" : code, content == null ? "" : content).toUpperCase();
        Matcher matcher = ORDER_NUMBER_PATTERN.matcher(source);
        if (matcher.find()) {
            return matcher.group(1);
        }

        Matcher compactMatcher = COMPACT_ORDER_NUMBER_PATTERN.matcher(source);
        return compactMatcher.find()
                ? "BEO-" + compactMatcher.group(1) + "-" + compactMatcher.group(2)
                : null;
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
    public static class SePayWebhookRequest {
        private Long id;
        private String code;
        private String content;
        private String transferType;
        private BigDecimal transferAmount;
        private String referenceCode;
    }
}
