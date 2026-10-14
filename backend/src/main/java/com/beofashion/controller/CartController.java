package com.beofashion.controller;

import com.beofashion.dto.ApiResponse;
import com.beofashion.dto.CartDto;
import com.beofashion.dto.CartItemRequest;
import com.beofashion.security.UserPrincipal;
import com.beofashion.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Shopping Cart", description = "Cart items management for guest and logged-in users")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get current cart")
    public ResponseEntity<ApiResponse<CartDto>> getCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String sessionId,
            @RequestHeader(value = "X-Session-Id", required = false) String headerSessionId) {
        Long userId = principal != null ? principal.getId() : null;
        CartDto cart = cartService.getOrCreateCart(userId, resolveSessionId(sessionId, headerSessionId));
        return ResponseEntity.ok(ApiResponse.ok(cart));
    }

    @PostMapping("/items")
    @Operation(summary = "Add item to cart")
    public ResponseEntity<ApiResponse<CartDto>> addItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-Session-Id", required = false) String headerSessionId,
            @Valid @RequestBody CartItemRequest request) {
        Long userId = principal != null ? principal.getId() : null;
        request.setSessionId(resolveSessionId(request.getSessionId(), headerSessionId));
        CartDto cart = cartService.addItemToCart(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Item added to cart", cart));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<ApiResponse<CartDto>> updateQuantity(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId,
            @RequestParam int quantity,
            @RequestParam(required = false) String sessionId,
            @RequestHeader(value = "X-Session-Id", required = false) String headerSessionId) {
        Long userId = principal != null ? principal.getId() : null;
        CartDto cart = cartService.updateItemQuantity(userId, resolveSessionId(sessionId, headerSessionId), itemId, quantity);
        return ResponseEntity.ok(ApiResponse.ok("Cart updated", cart));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<ApiResponse<CartDto>> removeItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId,
            @RequestParam(required = false) String sessionId,
            @RequestHeader(value = "X-Session-Id", required = false) String headerSessionId) {
        Long userId = principal != null ? principal.getId() : null;
        CartDto cart = cartService.removeItemFromCart(userId, resolveSessionId(sessionId, headerSessionId), itemId);
        return ResponseEntity.ok(ApiResponse.ok("Item removed from cart", cart));
    }

    @DeleteMapping
    @Operation(summary = "Clear entire shopping cart")
    public ResponseEntity<ApiResponse<CartDto>> clearCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String sessionId,
            @RequestHeader(value = "X-Session-Id", required = false) String headerSessionId) {
        Long userId = principal != null ? principal.getId() : null;
        CartDto cart = cartService.clearEntireCart(userId, resolveSessionId(sessionId, headerSessionId));
        return ResponseEntity.ok(ApiResponse.ok("Cart cleared", cart));
    }

    private String resolveSessionId(String explicitSessionId, String headerSessionId) {
        return explicitSessionId != null && !explicitSessionId.isBlank()
                ? explicitSessionId
                : headerSessionId;
    }
}
