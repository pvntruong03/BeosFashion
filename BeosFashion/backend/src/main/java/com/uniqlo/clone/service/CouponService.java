package com.uniqlo.clone.service;

import com.uniqlo.clone.dto.CouponDto;
import com.uniqlo.clone.dto.CouponValidateRequest;
import com.uniqlo.clone.entity.Coupon;
import com.uniqlo.clone.entity.DiscountType;
import com.uniqlo.clone.exception.BadRequestException;
import com.uniqlo.clone.exception.ResourceNotFoundException;
import com.uniqlo.clone.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public CouponDto validateCoupon(CouponValidateRequest request) {
        Coupon coupon = couponRepository.findByCodeIgnoreCaseAndActiveTrue(request.getCode().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or inactive coupon code: " + request.getCode()));

        LocalDate now = LocalDate.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            throw new BadRequestException("This promotion has not started yet");
        }

        if (coupon.getEndDate() != null && now.isAfter(coupon.getEndDate())) {
            throw new BadRequestException("This promotion has expired");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon usage limit has been reached");
        }

        if (coupon.getMinOrderAmount() != null && request.getOrderAmount().compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Order minimum amount of " + coupon.getMinOrderAmount() + " VND required for this coupon");
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (coupon.getDiscountType() == DiscountType.PERCENT) {
            discount = request.getOrderAmount().multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else if (coupon.getDiscountType() == DiscountType.FIXED_AMOUNT) {
            discount = coupon.getDiscountValue();
            if (discount.compareTo(request.getOrderAmount()) > 0) {
                discount = request.getOrderAmount();
            }
        }

        CouponDto dto = mapToDto(coupon);
        dto.setCalculatedDiscount(discount);
        return dto;
    }

    @Transactional
    public void incrementUsedCount(String code) {
        if (code != null && !code.isBlank()) {
            couponRepository.findByCodeIgnoreCase(code.trim()).ifPresent(coupon -> {
                coupon.setUsedCount(coupon.getUsedCount() + 1);
                couponRepository.save(coupon);
            });
        }
    }

    @Transactional(readOnly = true)
    public List<CouponDto> getAllCoupons() {
        return couponRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public CouponDto createCoupon(Coupon coupon) {
        if (couponRepository.findByCodeIgnoreCase(coupon.getCode()).isPresent()) {
            throw new BadRequestException("Coupon code already exists: " + coupon.getCode());
        }
        return mapToDto(couponRepository.save(coupon));
    }

    public CouponDto mapToDto(Coupon coupon) {
        return CouponDto.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .startDate(coupon.getStartDate())
                .endDate(coupon.getEndDate())
                .usageLimit(coupon.getUsageLimit())
                .usedCount(coupon.getUsedCount())
                .active(coupon.isActive())
                .build();
    }
}
