package com.beofashion.controller;

import com.beofashion.dto.ApiResponse;
import com.beofashion.dto.CouponDto;
import com.beofashion.dto.CouponValidateRequest;
import com.beofashion.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "Coupon validation and discounts")
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    @Operation(summary = "Validate coupon code and calculate discount amount")
    public ResponseEntity<ApiResponse<CouponDto>> validateCoupon(@Valid @RequestBody CouponValidateRequest request) {
        CouponDto coupon = couponService.validateCoupon(request);
        return ResponseEntity.ok(ApiResponse.ok("Coupon applied successfully", coupon));
    }
}
