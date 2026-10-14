package com.beofashion.service;

import com.beofashion.dto.ProductDto;
import com.beofashion.dto.VisualSearchRequest;
import com.beofashion.dto.VisualSearchResultDto;
import com.beofashion.entity.Product;
import com.beofashion.repository.ProductRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class VisualSearchServiceTest {

    private final ProductRepository repository = mock(ProductRepository.class);
    private final ProductService productService = mock(ProductService.class);
    private final VisualSearchService service = new VisualSearchService(repository, productService);

    @Test
    void ranksProductsFromClipScoresInsteadOfFileNameKeywords() {
        Product first = Product.builder().id(1L).name("Oxford Shirt").active(true).build();
        Product second = Product.builder().id(2L).name("Black Jacket").active(true).build();
        when(repository.findByActiveTrue()).thenReturn(List.of(first, second));
        when(productService.mapToDto(first)).thenReturn(ProductDto.builder().id(1L).name(first.getName()).build());
        when(productService.mapToDto(second)).thenReturn(ProductDto.builder().id(2L).name(second.getName()).build());

        VisualSearchResultDto result = service.searchByImage(VisualSearchRequest.builder()
                .imageUrl("photo-with-no-product-name.jpg")
                .modelId("Xenova/clip-vit-base-patch32")
                .clipScores(Map.of(1L, 0.12, 2L, 0.81))
                .detectedLabels(List.of("black adult jacket"))
                .build());

        assertThat(result.getAnalysisMode()).isEqualTo("CLIP_IMAGE_TEXT_EMBEDDING");
        assertThat(result.getMatchedProducts()).extracting(item -> item.getProduct().getId()).containsExactly(2L, 1L);
        assertThat(result.getMatchedProducts().get(0).getSimilarityPercentage()).isEqualTo(99);
    }

    @Test
    void rejectsRequestsWithoutClipEmbeddings() {
        assertThatThrownBy(() -> service.searchByImage(new VisualSearchRequest()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("CLIP");
    }
}
