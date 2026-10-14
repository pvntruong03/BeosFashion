package com.beofashion.service;

import com.beofashion.dto.ProductDto;
import com.beofashion.dto.ProductImageDto;
import com.beofashion.dto.ProductVariantDto;
import com.beofashion.entity.*;
import com.beofashion.exception.ResourceNotFoundException;
import com.beofashion.repository.CategoryRepository;
import com.beofashion.repository.ProductRepository;
import com.beofashion.repository.ProductVariantRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<ProductDto> getFilteredProducts(
            Gender gender,
            Long categoryId,
            String categorySlug,
            String collection,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String color,
            String size,
            Boolean featured,
            Boolean isNew,
            Boolean bestSeller,
            Boolean limitedOffer,
            String search,
            int page,
            int sizePerPage,
            String sortBy,
            String sortDirection) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection.equalsIgnoreCase("ASC") ? "ASC" : "DESC"),
                sortBy != null ? sortBy : "createdAt");
        Pageable pageable = PageRequest.of(page, sizePerPage, sort);

        Specification<Product> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.isTrue(root.get("active")));

            if (gender != null) {
                predicates.add(criteriaBuilder.equal(root.get("gender"), gender));
            }

            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            } else if (categorySlug != null && !categorySlug.isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("slug"), categorySlug));
            }

            if (collection != null && !collection.isBlank()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("collection")), "%" + collection.toLowerCase() + "%"));
            }

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        criteriaBuilder.coalesce(root.get("salePrice"), root.get("basePrice")), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        criteriaBuilder.coalesce(root.get("salePrice"), root.get("basePrice")), maxPrice));
            }

            if (featured != null) {
                predicates.add(criteriaBuilder.equal(root.get("featured"), featured));
            }

            if (isNew != null) {
                predicates.add(criteriaBuilder.equal(root.get("isNew"), isNew));
            }

            if (bestSeller != null) {
                predicates.add(criteriaBuilder.equal(root.get("bestSeller"), bestSeller));
            }

            if (limitedOffer != null) {
                predicates.add(criteriaBuilder.equal(root.get("limitedOffer"), limitedOffer));
            }

            if (search != null && !search.isBlank()) {
                String searchLower = "%" + search.toLowerCase() + "%";
                Predicate nameMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchLower);
                Predicate codeMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("code")), searchLower);
                Predicate collectionMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("collection")), searchLower);
                predicates.add(criteriaBuilder.or(nameMatch, codeMatch, collectionMatch));
            }

            if (color != null && !color.isBlank() || (size != null && !size.isBlank())) {
                Join<Product, ProductVariant> variantsJoin = root.join("variants");
                if (color != null && !color.isBlank()) {
                    predicates.add(criteriaBuilder.like(criteriaBuilder.lower(variantsJoin.get("colorName")), "%" + color.toLowerCase() + "%"));
                }
                if (size != null && !size.isBlank()) {
                    predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(variantsJoin.get("size")), size.toLowerCase()));
                }
                query.distinct(true);
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        return productRepository.findAll(spec, pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToDto(product);
    }

    @Transactional(readOnly = true)
    public ProductDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));
        return mapToDto(product);
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getFeaturedProducts() {
        return productRepository.findByFeaturedTrueAndActiveTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getNewArrivals() {
        List<Product> products = productRepository.findByIsNewTrueAndActiveTrue();
        if (products == null || products.isEmpty()) {
            products = productRepository.findByActiveTrueOrderByCreatedAtDesc(PageRequest.of(0, 8)).getContent();
        }
        return products.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getBestSellers() {
        List<Product> products = productRepository.findByBestSellerTrueAndActiveTrue();
        if (products == null || products.isEmpty()) {
            products = productRepository.findByFeaturedTrueAndActiveTrue();
        }
        return products.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getRelatedProducts(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        return productRepository.findRelatedProducts(product.getCategory().getId(), productId, PageRequest.of(0, 4))
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> searchProducts(String query) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }
        return productRepository.searchProducts(query.trim(), PageRequest.of(0, 10))
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public ProductDto mapToDto(Product product) {
        List<ProductVariantDto> variantDtos = product.getVariants() != null
                ? product.getVariants().stream()
                    .filter(ProductVariant::isActive)
                    .map(this::mapVariantToDto)
                    .collect(Collectors.toList())
                : List.of();

        List<ProductImageDto> imageDtos = product.getImages() != null
                ? product.getImages().stream().map(this::mapImageToDto).collect(Collectors.toList())
                : List.of();

        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .code(product.getCode())
                .slug(product.getSlug())
                .description(product.getDescription())
                .overview(product.getOverview())
                .material(product.getMaterial())
                .careInstruction(product.getCareInstruction())
                .basePrice(product.getBasePrice())
                .salePrice(product.getSalePrice())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categorySlug(product.getCategory() != null ? product.getCategory().getSlug() : null)
                .gender(product.getGender())
                .collection(product.getCollection())
                .featured(product.isFeatured())
                .isNew(product.isNew())
                .bestSeller(product.isBestSeller())
                .limitedOffer(product.isLimitedOffer())
                .primaryImageUrl(product.getPrimaryImageUrl())
                .averageRating(product.getAverageRating())
                .reviewCount(product.getReviewCount())
                .active(product.isActive())
                .variants(variantDtos)
                .images(imageDtos)
                .build();
    }

    public ProductVariantDto mapVariantToDto(ProductVariant variant) {
        BigDecimal effectivePrice = variant.getProduct().getSalePrice() != null
                ? variant.getProduct().getSalePrice().add(variant.getPriceAdjustment())
                : variant.getProduct().getBasePrice().add(variant.getPriceAdjustment());

        List<ProductVariantDto.StoreInventoryDto> storeInventories = variant.getInventories() != null
                ? variant.getInventories().stream().map(inv -> ProductVariantDto.StoreInventoryDto.builder()
                        .storeId(inv.getStore().getId())
                        .storeName(inv.getStore().getName())
                        .storeCode(inv.getStore().getCode())
                        .quantity(inv.getQuantity())
                        .inStock(inv.getQuantity() > 0)
                        .build()).collect(Collectors.toList())
                : List.of();

        return ProductVariantDto.builder()
                .id(variant.getId())
                .productId(variant.getProduct().getId())
                .sku(variant.getSku())
                .colorName(variant.getColorName())
                .colorHex(variant.getColorHex())
                .size(variant.getSize())
                .priceAdjustment(variant.getPriceAdjustment())
                .effectivePrice(effectivePrice)
                .imageUrl(variant.getImageUrl())
                .barcode(variant.getBarcode())
                .totalStock(variant.getTotalStock())
                .active(variant.isActive())
                .storeInventories(storeInventories)
                .build();
    }

    public ProductImageDto mapImageToDto(ProductImage image) {
        return ProductImageDto.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .colorName(image.getColorName())
                .altText(image.getAltText())
                .displayOrder(image.getDisplayOrder())
                .isModelShot(image.isModelShot())
                .build();
    }
}
