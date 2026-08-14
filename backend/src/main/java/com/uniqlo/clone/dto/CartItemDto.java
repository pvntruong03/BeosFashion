package com.uniqlo.clone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto {
    private Long id;
    private Long variantId;
    private Long productId;
    private String productName;
    private String productCode;
    private String productSlug;
    private String colorName;
    private String colorHex;
    private String size;
    private String imageUrl;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subTotal;
    private Integer availableStock;
}
