package com.uniqlo.clone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartDto {
    private Long id;
    private Long userId;
    private String sessionId;
    private List<CartItemDto> items;
    private Integer totalQuantity;
    private BigDecimal subTotal;
    private BigDecimal estimatedShipping;
    private BigDecimal freeShippingThreshold;
    private boolean eligibleForFreeShipping;
}
