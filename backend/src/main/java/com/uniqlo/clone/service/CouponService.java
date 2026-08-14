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

    @Transactional
    public void decrementUsedCount(String code) {
        if (code != null && !code.isBlank()) {
            couponRepository.findByCodeIgnoreCase(code.trim()).ifPresent(coupon -> {
                if (coupon.getUsedCount() != null && coupon.getUsedCount() > 0) {
                    coupon.setUsedCount(coupon.getUsedCount() - 1);
                    couponRepository.save(coupon);
                }
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
        if (coupon.getUsageLimit() == null || coupon.getUsageLimit() <= 0) {
            coupon.setUsageLimit(100);
        }
        if (coupon.getUsedCount() == null) {
            coupon.setUsedCount(0);
        }
        return mapToDto(couponRepository.save(coupon));
    }

    @Transactional
    public CouponDto updateCoupon(Long id, CouponDto dto) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));

        if (dto.getCode() != null && !dto.getCode().equalsIgnoreCase(coupon.getCode())) {
            couponRepository.findByCodeIgnoreCase(dto.getCode().trim()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new BadRequestException("Coupon code already exists: " + dto.getCode());
                }
            });
            coupon.setCode(dto.getCode().trim().toUpperCase());
        }

        if (dto.getDescription() != null) coupon.setDescription(dto.getDescription());
        if (dto.getDiscountType() != null) coupon.setDiscountType(dto.getDiscountType());
        if (dto.getDiscountValue() != null) coupon.setDiscountValue(dto.getDiscountValue());
        if (dto.getMinOrderAmount() != null) coupon.setMinOrderAmount(dto.getMinOrderAmount());
        if (dto.getMaxDiscountAmount() != null) coupon.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        if (dto.getStartDate() != null) coupon.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) coupon.setEndDate(dto.getEndDate());
        if (dto.getUsageLimit() != null) coupon.setUsageLimit(dto.getUsageLimit());
        coupon.setActive(dto.isActive());

        return mapToDto(couponRepository.save(coupon));
    }

    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));
        couponRepository.delete(coupon);
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
