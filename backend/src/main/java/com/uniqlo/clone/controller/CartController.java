package com.uniqlo.clone.controller;

import com.uniqlo.clone.dto.ApiResponse;
import com.uniqlo.clone.dto.CartDto;
import com.uniqlo.clone.dto.CartItemRequest;
import com.uniqlo.clone.security.UserPrincipal;
import com.uniqlo.clone.service.CartService;
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
            @RequestParam(required = false) String sessionId) {
        Long userId = principal != null ? principal.getId() : null;
        CartDto cart = cartService.getOrCreateCart(userId, sessionId);
        return ResponseEntity.ok(ApiResponse.ok(cart));
    }

    @PostMapping("/items")
    @Operation(summary = "Add item to cart")
    public ResponseEntity<ApiResponse<CartDto>> addItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CartItemRequest request) {
        Long userId = principal != null ? principal.getId() : null;
        CartDto cart = cartService.addItemToCart(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Item added to cart", cart));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<ApiResponse<CartDto>> updateQuantity(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId,
            @RequestParam int quantity,
            @RequestParam(required = false) String sessionId) {
        Long userId = principal != null ? principal.getId() : null;
        CartDto cart = cartService.updateItemQuantity(userId, sessionId, itemId, quantity);
        return ResponseEntity.ok(ApiResponse.ok("Cart updated", cart));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<ApiResponse<CartDto>> removeItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId,
            @RequestParam(required = false) String sessionId) {
        Long userId = principal != null ? principal.getId() : null;
        CartDto cart = cartService.removeItemFromCart(userId, sessionId, itemId);
        return ResponseEntity.ok(ApiResponse.ok("Item removed from cart", cart));
    }

    @DeleteMapping
    @Operation(summary = "Clear entire shopping cart")
    public ResponseEntity<ApiResponse<CartDto>> clearCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String sessionId) {
        Long userId = principal != null ? principal.getId() : null;
        CartDto cart = cartService.clearEntireCart(userId, sessionId);
        return ResponseEntity.ok(ApiResponse.ok("Cart cleared", cart));
    }
}
