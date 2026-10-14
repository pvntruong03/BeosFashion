package com.beofashion.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.beofashion.entity.Gender;
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

    @JsonProperty("isNew")
    @JsonAlias({"new", "isNew"})
    private boolean isNew;

    @JsonProperty("bestSeller")
    @JsonAlias({"bestSeller", "isBestSeller"})
    private boolean bestSeller;

    @JsonProperty("limitedOffer")
    @JsonAlias({"limitedOffer", "isLimitedOffer"})
    private boolean limitedOffer;

    private String primaryImageUrl;
    private Double averageRating;
    private Integer reviewCount;
    private boolean active;
    private List<ProductVariantDto> variants;
    private List<ProductImageDto> images;
}
