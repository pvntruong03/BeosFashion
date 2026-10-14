package com.beofashion.service;

import com.beofashion.dto.VisualSearchRequest;
import com.beofashion.dto.VisualSearchResultDto;
import com.beofashion.entity.Product;
import com.beofashion.entity.ProductVariant;
import com.beofashion.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class VisualSearchService {

    private static final String DEFAULT_MODEL = "Xenova/clip-vit-base-patch32";

    private final ProductRepository productRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public VisualSearchResultDto searchByImage(VisualSearchRequest request) {
        long startTime = System.currentTimeMillis();
        Map<Long, Double> clipScores = request.getClipScores();
        if (clipScores == null || clipScores.isEmpty()) {
            throw new IllegalArgumentException("CLIP image embeddings are required for visual search");
        }

        List<Product> products = productRepository.findByActiveTrue();
        double bestScore = products.stream()
                .map(Product::getId)
                .map(clipScores::get)
                .filter(Objects::nonNull)
                .filter(Double::isFinite)
                .max(Double::compareTo)
                .orElse(0d);

        if (bestScore <= 0d) {
            throw new IllegalArgumentException("CLIP did not return a valid similarity score");
        }

        List<VisualSearchResultDto.VisualMatchedProductDto> matches = new ArrayList<>();
        for (Product product : products) {
            Double rawScore = clipScores.get(product.getId());
            if (rawScore == null || !Double.isFinite(rawScore) || rawScore <= 0d) {
                continue;
            }

            int relevance = Math.max(45, Math.min(99, (int) Math.round(45d + (rawScore / bestScore) * 54d)));
            matches.add(VisualSearchResultDto.VisualMatchedProductDto.builder()
                    .product(productService.mapToDto(product))
                    .similarityPercentage(relevance)
                    .matchedColor(resolvePrimaryColor(product))
                    .matchReason("CLIP image-text embedding similarity")
                    .build());
        }

        matches.sort(Comparator
                .comparingInt(VisualSearchResultDto.VisualMatchedProductDto::getSimilarityPercentage)
                .reversed()
                .thenComparing(item -> item.getProduct().getName()));
        if (matches.size() > 12) {
            matches = new ArrayList<>(matches.subList(0, 12));
        }

        List<String> labels = request.getDetectedLabels() == null
                ? List.of()
                : request.getDetectedLabels().stream().filter(Objects::nonNull).limit(5).toList();

        String category = matches.isEmpty() || matches.get(0).getProduct().getCategoryName() == null
                ? "Fashion"
                : matches.get(0).getProduct().getCategoryName();
        String color = matches.isEmpty() ? "Multiple colors" : matches.get(0).getMatchedColor();

        return VisualSearchResultDto.builder()
                .queryImageUrl(request.getImageUrl())
                .modelId(request.getModelId() == null || request.getModelId().isBlank() ? DEFAULT_MODEL : request.getModelId())
                .analysisMode("CLIP_IMAGE_TEXT_EMBEDDING")
                .primaryDetectedCategory(category)
                .primaryDetectedColor(color)
                .detectedTags(labels)
                .analysisTimeMs(Math.max(1, System.currentTimeMillis() - startTime))
                .matchedProducts(matches)
                .build();
    }

    private String resolvePrimaryColor(Product product) {
        if (product.getVariants() == null) {
            return "Multiple colors";
        }
        return product.getVariants().stream()
                .filter(ProductVariant::isActive)
                .map(ProductVariant::getColorName)
                .filter(Objects::nonNull)
                .filter(value -> !value.isBlank())
                .findFirst()
                .map(value -> value.toUpperCase(Locale.ROOT))
                .orElse("Multiple colors");
    }
}
