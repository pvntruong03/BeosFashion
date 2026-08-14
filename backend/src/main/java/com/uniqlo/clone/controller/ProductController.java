package com.uniqlo.clone.controller;

import com.uniqlo.clone.dto.ApiResponse;
import com.uniqlo.clone.dto.ProductDto;
import com.uniqlo.clone.entity.Gender;
import com.uniqlo.clone.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product catalog, filtering, search, and details")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get filtered products with pagination")
    public ResponseEntity<ApiResponse<Page<ProductDto>>> getProducts(
            @RequestParam(required = false) Gender gender,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) String collection,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Boolean isNew,
            @RequestParam(required = false) Boolean bestSeller,
            @RequestParam(required = false) Boolean limitedOffer,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int sizePerPage,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Page<ProductDto> products = productService.getFilteredProducts(
                gender, categoryId, categorySlug, collection, minPrice, maxPrice, color, size,
                featured, isNew, bestSeller, limitedOffer, search, page, sizePerPage, sortBy, sortDirection
        );

        return ResponseEntity.ok(ApiResponse.ok(products));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product details by ID")
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(@PathVariable Long id) {
        ProductDto product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.ok(product));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get product details by slug")
    public ResponseEntity<ApiResponse<ProductDto>> getProductBySlug(@PathVariable String slug) {
        ProductDto product = productService.getProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(product));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured products")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getFeaturedProducts() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getFeaturedProducts()));
    }

    @GetMapping("/new-arrivals")
    @Operation(summary = "Get new arrival products")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getNewArrivals() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getNewArrivals()));
    }

    @GetMapping("/best-sellers")
    @Operation(summary = "Get best selling products")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getBestSellers() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getBestSellers()));
    }

    @GetMapping("/{id}/related")
    @Operation(summary = "Get related products")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getRelatedProducts(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getRelatedProducts(id)));
    }

    @GetMapping("/search")
    @Operation(summary = "Instant search and autocomplete")
    public ResponseEntity<ApiResponse<List<ProductDto>>> searchProducts(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.ok(productService.searchProducts(q)));
    }

    private final com.uniqlo.clone.service.VisualSearchService visualSearchService;

    @PostMapping("/visual-search")
    @Operation(summary = "Search products by uploaded or referenced image (Visual AI Matching)")
    public ResponseEntity<ApiResponse<com.uniqlo.clone.dto.VisualSearchResultDto>> visualSearch(
            @RequestBody com.uniqlo.clone.dto.VisualSearchRequest request) {
        com.uniqlo.clone.dto.VisualSearchResultDto results = visualSearchService.searchByImage(request);
        return ResponseEntity.ok(ApiResponse.ok("Visual search completed successfully", results));
    }
}
