package com.uniqlo.clone.dto;

import com.uniqlo.clone.entity.Gender;
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
public class ProductDto {
    private Long id;
    private String name;
    private String code;
    private String slug;
    private String description;
    private String overview;
    private String material;
    private String careInstruction;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private Gender gender;
    private String collection;
    private boolean featured;
    private boolean isNew;
    private boolean bestSeller;
    private boolean limitedOffer;
    private String primaryImageUrl;
    private Double averageRating;
    private Integer reviewCount;
    private boolean active;
    private List<ProductVariantDto> variants;
    private List<ProductImageDto> images;
}
