package com.beofashion.controller;

import com.beofashion.dto.ApiResponse;
import com.beofashion.dto.ReviewDto;
import com.beofashion.dto.ReviewRequest;
import com.beofashion.security.UserPrincipal;
import com.beofashion.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Product customer reviews and ratings")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get reviews for a product")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getProductReviews(productId)));
    }

    @PostMapping
    @Operation(summary = "Submit a review for a purchased product")
    public ResponseEntity<ApiResponse<ReviewDto>> createReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ReviewRequest request) {
        ReviewDto review = reviewService.createReview(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Review submitted successfully", review));
    }
}
