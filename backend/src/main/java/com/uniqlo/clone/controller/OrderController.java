package com.uniqlo.clone.controller;

import com.uniqlo.clone.dto.ApiResponse;
import com.uniqlo.clone.dto.CheckoutRequest;
import com.uniqlo.clone.dto.OrderDto;
import com.uniqlo.clone.security.UserPrincipal;
import com.uniqlo.clone.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders & Checkout", description = "Order placement, tracking, and customer order history")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Place a new order (Checkout)")
    public ResponseEntity<ApiResponse<OrderDto>> checkout(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String sessionId,
            @Valid @RequestBody CheckoutRequest request) {
        Long userId = principal != null ? principal.getId() : null;
        OrderDto order = orderService.createCheckoutOrder(userId, sessionId, request);
        return ResponseEntity.ok(ApiResponse.ok("Order placed successfully", order));
    }

    @GetMapping("/my-orders")
    @Operation(summary = "Get current customer's order history")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getMyOrders(@AuthenticationPrincipal UserPrincipal principal) {
        List<OrderDto> orders = orderService.getMyOrders(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @GetMapping("/track/{orderNumber}")
    @Operation(summary = "Track order status by order number")
    public ResponseEntity<ApiResponse<OrderDto>> trackOrder(@PathVariable String orderNumber) {
        OrderDto order = orderService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable Long id) {
        OrderDto order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel an order (if not shipped) and restore inventory")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        Long userId = principal != null ? principal.getId() : null;
        boolean isStaffOrAdmin = principal != null && principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF_MANAGER"));
        OrderDto order = orderService.cancelOrder(id, userId, isStaffOrAdmin, reason);
        return ResponseEntity.ok(ApiResponse.ok("Order cancelled and inventory restocked successfully", order));
    }
}
