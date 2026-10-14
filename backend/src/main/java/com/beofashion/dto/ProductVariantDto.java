package com.beofashion.dto;

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
public class ProductVariantDto {
    private Long id;
    private Long productId;
    private String sku;
    private String colorName;
    private String colorHex;
    private String size;
    private BigDecimal priceAdjustment;
    private BigDecimal effectivePrice;
    private String imageUrl;
    private String barcode;
    private Integer totalStock;
    private boolean active;
    private List<StoreInventoryDto> storeInventories;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StoreInventoryDto {
        private Long storeId;
        private String storeName;
        private String storeCode;
        private Integer quantity;
        private boolean inStock;
    }
}
