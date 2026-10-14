package com.beofashion.service;

import com.beofashion.entity.Inventory;
import com.beofashion.entity.Product;
import com.beofashion.entity.ProductVariant;
import com.beofashion.repository.InventoryRepository;
import com.beofashion.repository.ProductRepository;
import com.beofashion.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class CatalogVariantSanitizer {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryRepository inventoryRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void sanitizeLegacyVariants() {
        int numericSizesDisabled = 0;
        int duplicateVariantsMerged = 0;
        int testProductsHidden = 0;

        // Remove the known catalog record created during the product-save verification.
        // It has no place in the customer catalog and is kept inactive rather than erased,
        // so existing references remain intact if it was used by a historical order.
        var verificationProduct = productRepository.findByCode("BEO-PERSIST-897756");
        if (verificationProduct.isPresent() && verificationProduct.get().isActive()) {
            verificationProduct.get().setActive(false);
            productRepository.save(verificationProduct.get());
            testProductsHidden++;
        }

        for (Product product : productRepository.findAll()) {
            List<ProductVariant> variants = variantRepository.findByProductId(product.getId()).stream()
                    .sorted(Comparator.comparing(ProductVariant::getId))
                    .toList();

            for (ProductVariant variant : variants) {
                if (variant.isActive() && isLegacyNumericSize(variant.getSize())) {
                    variant.setActive(false);
                    numericSizesDisabled++;
                }
            }

            Map<String, ProductVariant> canonicalBySelection = new LinkedHashMap<>();
            for (ProductVariant variant : variants) {
                if (!variant.isActive()) {
                    continue;
                }
                String key = normalize(variant.getColorName()) + "|" + normalize(variant.getSize());
                ProductVariant canonical = canonicalBySelection.putIfAbsent(key, variant);
                if (canonical == null) {
                    continue;
                }

                mergeInventory(canonical, variant);
                canonical.setTotalStock(safe(canonical.getTotalStock()) + safe(variant.getTotalStock()));
                if ((canonical.getImageUrl() == null || canonical.getImageUrl().isBlank())
                        && variant.getImageUrl() != null && !variant.getImageUrl().isBlank()) {
                    canonical.setImageUrl(variant.getImageUrl());
                }
                variant.setActive(false);
                duplicateVariantsMerged++;
            }
            variantRepository.saveAll(variants);
        }

        if (numericSizesDisabled > 0 || duplicateVariantsMerged > 0 || testProductsHidden > 0) {
            log.info("Catalog cleanup completed: {} legacy numeric variants disabled, {} duplicate variants merged, {} verification products hidden",
                    numericSizesDisabled, duplicateVariantsMerged, testProductsHidden);
        }
    }

    private void mergeInventory(ProductVariant canonical, ProductVariant duplicate) {
        for (Inventory source : inventoryRepository.findByProductVariantId(duplicate.getId())) {
            inventoryRepository.findByStoreIdAndProductVariantId(source.getStore().getId(), canonical.getId())
                    .ifPresent(target -> {
                        target.setQuantity(safe(target.getQuantity()) + safe(source.getQuantity()));
                        target.setReservedQuantity(safe(target.getReservedQuantity()) + safe(source.getReservedQuantity()));
                        inventoryRepository.save(target);
                    });
        }
    }

    private boolean isLegacyNumericSize(String size) {
        return size != null && size.trim().matches("\\d{2,3}");
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().replaceAll("\\s+", " ").toUpperCase(Locale.ROOT);
    }

    private int safe(Integer value) {
        return value == null ? 0 : value;
    }
}
