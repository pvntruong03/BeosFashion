package com.beofashion.controller;

import com.beofashion.dto.ApiResponse;
import com.beofashion.dto.ProductDto;
import com.beofashion.security.UserPrincipal;
import com.beofashion.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "Customer favorite wishlist management")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @Operation(summary = "Get current user wishlist items")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getWishlist(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(wishlistService.getUserWishlist(principal.getId())));
    }

    @PostMapping("/toggle/{productId}")
    @Operation(summary = "Toggle product in wishlist (Add/Remove)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleWishlist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        boolean inWishlist = wishlistService.toggleWishlist(principal.getId(), productId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "productId", productId,
                "inWishlist", inWishlist,
                "message", inWishlist ? "Added to wishlist" : "Removed from wishlist"
        )));
    }

    @GetMapping("/check/{productId}")
    @Operation(summary = "Check if product is in current user wishlist")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkWishlist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        boolean inWishlist = principal != null && wishlistService.isProductInWishlist(principal.getId(), productId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("inWishlist", inWishlist)));
    }
}
