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
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
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

    // Flexible regex: matches BEO-261018-28097, BEO 261018 28097, BEO_261018_28097, BEO26101828097
    private static final Pattern ORDER_NUMBER_PATTERN = Pattern.compile(
            "BEO[-_\\s]?(\\d{6})[-_\\s]?(\\d{4,5}|[A-Z0-9]{5})", Pattern.CASE_INSENSITIVE);

    // Fallback for fully compact format: BEO261014EE67F
    private static final Pattern COMPACT_ORDER_NUMBER_PATTERN = Pattern.compile(
            "BEO(\\d{6})([A-Z0-9]{5})", Pattern.CASE_INSENSITIVE);

    // Maximum allowed difference between transfer amount and order total (VND)
    // Banks may add small fees or round amounts
    private static final BigDecimal AMOUNT_TOLERANCE = new BigDecimal("1000");

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

        log.info("[SePay Webhook] Received: id={}, amount={}, type={}, code={}, content={}",
                request.getId(), request.getTransferAmount(), request.getTransferType(),
                request.getCode(), request.getContent());

        verifySePayAuthorization(authorization);

        if (request.getId() == null || request.getTransferAmount() == null || request.getTransferAmount().signum() <= 0) {
            log.warn("[SePay Webhook] REJECTED: Missing transaction id or invalid amount");
            throw new IllegalArgumentException("SePay webhook is missing a valid transaction id or amount");
        }
        if (!"in".equalsIgnoreCase(request.getTransferType())) {
            log.warn("[SePay Webhook] REJECTED: Not an incoming transfer (type={})", request.getTransferType());
            throw new IllegalArgumentException("Only incoming SePay transfers can settle an order");
        }

        String transactionId = "SEPAY-" + request.getId();
        Optional<Payment> existingPayment = paymentRepository.findByTransactionId(transactionId);
        if (existingPayment.isPresent()) {
            log.info("[SePay Webhook] Duplicate transaction {} — already processed, returning success", transactionId);
            return ResponseEntity.ok(Map.of("success", true));
        }

        String orderNumber = extractOrderNumber(request.getCode(), request.getContent());
        if (orderNumber == null) {
            log.error("[SePay Webhook] FAILED: Cannot extract BEO order number from code='{}' content='{}'",
                    request.getCode(), request.getContent());
            // Return success to prevent SePay from retrying — the transfer doesn't match any order
            return ResponseEntity.ok(Map.of("success", true));
        }

        log.info("[SePay Webhook] Extracted order number: {}", orderNumber);

        Optional<Order> orderOpt = orderRepository.findByOrderNumber(orderNumber);
        if (orderOpt.isEmpty()) {
            log.error("[SePay Webhook] FAILED: Order '{}' not found in database", orderNumber);
            return ResponseEntity.ok(Map.of("success", true));
        }

        Order order = orderOpt.get();
        Payment payment = order.getPayment();
        if (payment == null || (payment.getPaymentMethod() != PaymentMethod.BANK_TRANSFER
                && payment.getPaymentMethod() != PaymentMethod.VIETQR)) {
            log.warn("[SePay Webhook] SKIPPED: Order {} payment method is {} — not a bank transfer",
                    orderNumber, payment != null ? payment.getPaymentMethod() : "null");
            return ResponseEntity.ok(Map.of("success", true));
        }

        // Allow a small tolerance for bank fees / rounding differences
        BigDecimal difference = request.getTransferAmount().subtract(order.getFinalAmount()).abs();
        if (difference.compareTo(AMOUNT_TOLERANCE) > 0) {
            log.warn("[SePay Webhook] AMOUNT MISMATCH: Order {} expects {} but received {} (diff={})",
                    orderNumber, order.getFinalAmount(), request.getTransferAmount(), difference);
            // Still return success to avoid SePay retry loops — log the mismatch for manual review
            return ResponseEntity.ok(Map.of("success", true));
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

        log.info("[SePay Webhook] SUCCESS: Order {} marked PAID (transaction={}, amount={})",
                orderNumber, transactionId, request.getTransferAmount());

        try {
            orderPaymentEmailService.sendPaidOrderEmail(order);
        } catch (Exception e) {
            log.warn("[SePay Webhook] Email notification failed for order {}: {}", orderNumber, e.getMessage());
        }
        return ResponseEntity.ok(Map.of("success", true));
    }

    private void verifySePayAuthorization(String authorization) {
        if (sePayWebhookApiKey == null || sePayWebhookApiKey.isBlank()) {
            log.warn("[SePay Webhook] API key not configured — skipping authorization check");
            return;
        }
        String expected = "Apikey " + sePayWebhookApiKey;
        if (authorization == null || !MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8), authorization.getBytes(StandardCharsets.UTF_8))) {
            log.warn("[SePay Webhook] UNAUTHORIZED: Invalid API key provided");
            throw new AccessDeniedException("Invalid SePay webhook authorization");
        }
    }

    private String extractOrderNumber(String code, String content) {
        String source = String.join(" ", code == null ? "" : code, content == null ? "" : content).toUpperCase();
        log.debug("[SePay Webhook] Extracting order number from: '{}'", source);

        Matcher matcher = ORDER_NUMBER_PATTERN.matcher(source);
        if (matcher.find()) {
            String extracted = "BEO-" + matcher.group(1) + "-" + matcher.group(2).toUpperCase();
            log.debug("[SePay Webhook] Matched primary pattern: {}", extracted);
            return extracted;
        }

        Matcher compactMatcher = COMPACT_ORDER_NUMBER_PATTERN.matcher(source);
        if (compactMatcher.find()) {
            String extracted = "BEO-" + compactMatcher.group(1) + "-" + compactMatcher.group(2).toUpperCase();
            log.debug("[SePay Webhook] Matched compact pattern: {}", extracted);
            return extracted;
        }

        log.debug("[SePay Webhook] No order number pattern found in: '{}'", source);
        return null;
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
