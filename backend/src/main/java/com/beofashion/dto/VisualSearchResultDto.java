package com.beofashion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisualSearchResultDto {
    private String queryImageUrl;
    private List<String> detectedTags;
    private String primaryDetectedCategory;
    private String primaryDetectedColor;
    private String modelId;
    private String analysisMode;
    private long analysisTimeMs;
    private List<VisualMatchedProductDto> matchedProducts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VisualMatchedProductDto {
        private ProductDto product;
        private int similarityPercentage; // e.g. 98, 95, 90
        private String matchedColor;
        private String matchReason;
    }
}
