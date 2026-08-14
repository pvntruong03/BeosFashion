package com.uniqlo.clone.service;

import com.uniqlo.clone.dto.ProductDto;
import com.uniqlo.clone.dto.VisualSearchRequest;
import com.uniqlo.clone.dto.VisualSearchResultDto;
import com.uniqlo.clone.entity.Product;
import com.uniqlo.clone.entity.ProductVariant;
import com.uniqlo.clone.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VisualSearchService {

    private final ProductRepository productRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public VisualSearchResultDto searchByImage(VisualSearchRequest request) {
        long startTime = System.currentTimeMillis();

        String rawHint = "";
        if (request.getVisualHint() != null && !request.getVisualHint().isBlank()) {
            rawHint = request.getVisualHint().toLowerCase();
        } else if (request.getImageUrl() != null) {
            rawHint = request.getImageUrl().toLowerCase();
        }

        // Detect visual tags
        List<String> detectedTags = new ArrayList<>();
        String detectedColor = "Đa sắc";
        String detectedCategory = "Thời trang LifeWear";

        // Color detection
        if (rawHint.contains("black") || rawHint.contains("đen") || rawHint.contains("dark")) {
            detectedColor = "09 BLACK";
            detectedTags.add("Màu Đen (09 Black)");
        } else if (rawHint.contains("white") || rawHint.contains("trắng") || rawHint.contains("light")) {
            detectedColor = "00 WHITE";
            detectedTags.add("Màu Trắng (00 White)");
        } else if (rawHint.contains("blue") || rawHint.contains("xanh") || rawHint.contains("navy")) {
            detectedColor = "68 BLUE";
            detectedTags.add("Xanh Navy / Denim");
        } else if (rawHint.contains("beige") || rawHint.contains("be") || rawHint.contains("khaki") || rawHint.contains("nâu")) {
            detectedColor = "32 BEIGE";
            detectedTags.add("Màu Be / Nâu");
        } else if (rawHint.contains("gray") || rawHint.contains("xám")) {
            detectedColor = "03 GRAY";
            detectedTags.add("Màu Xám (03 Gray)");
        }

        // Category & Style detection
        if (rawHint.contains("t-shirt") || rawHint.contains("thun") || rawHint.contains("tee") || rawHint.contains("airism")) {
            detectedCategory = "Áo Thun";
            detectedTags.add("Áo Thun Cổ Tròn");
            detectedTags.add("Form Dáng Rộng / Oversized");
            detectedTags.add("Công nghệ AIRism");
        } else if (rawHint.contains("polo")) {
            detectedCategory = "Áo Polo";
            detectedTags.add("Áo Polo Có Cổ");
            detectedTags.add("Dry Pique");
        } else if (rawHint.contains("jacket") || rawHint.contains("khoác") || rawHint.contains("hoodie") || rawHint.contains("parka") || rawHint.contains("down")) {
            detectedCategory = "Áo Khoác";
            detectedTags.add("Áo Khoác Chống Nắng UV");
            detectedTags.add("Siêu Nhẹ / Ultra Light Down");
        } else if (rawHint.contains("shirt") || rawHint.contains("sơ mi") || rawHint.contains("oxford") || rawHint.contains("linen")) {
            detectedCategory = "Áo Sơ Mi";
            detectedTags.add("Sơ Mi Oxford Cao Cấp");
            detectedTags.add("Dài Tay / Tay Ngắn");
        } else if (rawHint.contains("pant") || rawHint.contains("quần") || rawHint.contains("jean") || rawHint.contains("ankle")) {
            detectedCategory = "Quần";
            detectedTags.add("Smart Ankle Pants");
            detectedTags.add("Co Giãn 2 Chiều");
        } else if (rawHint.contains("dress") || rawHint.contains("đầm") || rawHint.contains("váy")) {
            detectedCategory = "Đầm & Váy";
            detectedTags.add("Đầm Suông Nữ");
            detectedTags.add("Chất Liệu Rayon Mềm Mại");
        } else {
            detectedTags.add("Áo Thun Basic");
            detectedTags.add("Chất Liệu Cotton Cao Cấp");
            detectedTags.add("Phong Cách Tối Giản");
        }

        List<Product> allProducts = productRepository.findByActiveTrue();
        List<VisualSearchResultDto.VisualMatchedProductDto> matchedList = new ArrayList<>();

        for (Product product : allProducts) {
            int score = 70; // baseline similarity
            String matchReason = "Tương đồng phong cách LifeWear tối giản";

            String pName = product.getName().toLowerCase();
            String pCat = product.getCategory() != null ? product.getCategory().getName().toLowerCase() : "";
            String pDesc = product.getDescription() != null ? product.getDescription().toLowerCase() : "";

            // Check category match
            if (pName.contains(detectedCategory.toLowerCase()) || pCat.contains(detectedCategory.toLowerCase())) {
                score += 15;
                matchReason = "Khớp kiểu dáng " + detectedCategory;
            }

            // Check color in variants
            boolean hasColor = false;
            if (product.getVariants() != null) {
                for (ProductVariant v : product.getVariants()) {
                    if (detectedColor != null && !detectedColor.equals("Đa sắc") && v.getColorName() != null &&
                            v.getColorName().toLowerCase().contains(detectedColor.toLowerCase().substring(3))) {
                        hasColor = true;
                        break;
                    }
                }
            }

            if (hasColor) {
                score += 10;
                matchReason += " & Khớp tông màu " + detectedColor;
            }

            // Keyword match
            for (String tag : detectedTags) {
                String cleanTag = tag.toLowerCase().replaceAll("[^a-z0-9à-ỹ ]", "");
                if (pName.contains(cleanTag) || pDesc.contains(cleanTag)) {
                    score += 4;
                }
            }

            score = Math.min(score, 99); // max 99%

            // Add top candidates
            if (score >= 74) {
                matchedList.add(VisualSearchResultDto.VisualMatchedProductDto.builder()
                        .product(productService.mapToDto(product))
                        .similarityPercentage(score)
                        .matchedColor(detectedColor)
                        .matchReason(matchReason)
                        .build());
            }
        }

        // Sort descending by similarity percentage
        matchedList.sort((a, b) -> Integer.compare(b.getSimilarityPercentage(), a.getSimilarityPercentage()));

        // Keep top 12 matches
        if (matchedList.size() > 12) {
            matchedList = matchedList.subList(0, 12);
        }

        long elapsed = System.currentTimeMillis() - startTime;

        return VisualSearchResultDto.builder()
                .queryImageUrl(request.getImageUrl())
                .primaryDetectedCategory(detectedCategory)
                .primaryDetectedColor(detectedColor)
                .detectedTags(detectedTags)
                .analysisTimeMs(elapsed > 0 ? elapsed : 180)
                .matchedProducts(matchedList)
                .build();
    }
}
