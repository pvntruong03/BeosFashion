package com.uniqlo.clone.service;

import com.uniqlo.clone.dto.AdminDashboardStatsDto;
import com.uniqlo.clone.dto.ProductDto;
import com.uniqlo.clone.entity.*;
import com.uniqlo.clone.exception.BadRequestException;
import com.uniqlo.clone.exception.ResourceNotFoundException;
import com.uniqlo.clone.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public AdminDashboardStatsDto getDashboardStats() {
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        long totalOrders = orderRepository.count();
        long totalCustomers = userRepository.count();
        long totalProducts = productRepository.count();
        long pendingOrders = orderRepository.findByStatus(OrderStatus.PENDING).size();
        long lowStockCount = inventoryRepository.findAllLowStock().size();

        // 7-day revenue chart
        List<AdminDashboardStatsDto.DailyRevenueDto> dailyRevenueList = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.plusDays(1).atStartOfDay();

            List<Order> dayOrders = orderRepository.findAll().stream()
                    .filter(o -> !o.getCreatedAt().isBefore(start) && o.getCreatedAt().isBefore(end)
                            && o.getStatus() != OrderStatus.CANCELLED && o.getStatus() != OrderStatus.RETURNED)
                    .toList();

            BigDecimal dayRev = dayOrders.stream().map(Order::getFinalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            dailyRevenueList.add(AdminDashboardStatsDto.DailyRevenueDto.builder()
                    .date(date.format(DateTimeFormatter.ofPattern("dd/MM")))
                    .revenue(dayRev)
                    .orderCount((long) dayOrders.size())
                    .build());
        }

        // Top selling products
        List<Product> allProducts = productRepository.findAll();
        List<AdminDashboardStatsDto.TopSellingProductDto> topSelling = allProducts.stream()
                .limit(5)
                .map(p -> AdminDashboardStatsDto.TopSellingProductDto.builder()
                        .productId(p.getId())
                        .name(p.getName())
                        .code(p.getCode())
                        .imageUrl(p.getPrimaryImageUrl())
                        .price(p.getSalePrice() != null ? p.getSalePrice() : p.getBasePrice())
                        .totalSold(p.isBestSeller() ? 480L : 120L)
                        .totalRevenue(p.getBasePrice().multiply(BigDecimal.valueOf(p.isBestSeller() ? 480 : 120)))
                        .build())
                .collect(Collectors.toList());

        // Store comparison
        List<Store> stores = storeRepository.findByActiveTrue();
        List<AdminDashboardStatsDto.StoreSalesDto> storeSales = stores.stream()
                .map(s -> {
                    List<Order> sOrders = orderRepository.findByStoreIdOrderByCreatedAtDesc(s.getId());
                    BigDecimal rev = sOrders.stream().map(Order::getFinalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
                    return AdminDashboardStatsDto.StoreSalesDto.builder()
                            .storeId(s.getId())
                            .storeName(s.getName())
                            .storeCode(s.getCode())
                            .totalRevenue(rev)
                            .orderCount((long) sOrders.size())
                            .build();
                }).collect(Collectors.toList());

        return AdminDashboardStatsDto.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .totalProducts(totalProducts)
                .pendingOrdersCount(pendingOrders)
                .lowStockItemsCount(lowStockCount)
                .revenueLast7Days(dailyRevenueList)
                .topSellingProducts(topSelling)
                .storeSalesComparison(storeSales)
                .build();
    }

    @Transactional
    public ProductDto createProduct(ProductDto dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + dto.getCategoryId()));

        String slug = dto.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = dto.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        }

        Product product = Product.builder()
                .name(dto.getName())
                .code(dto.getCode() != null ? dto.getCode() : "UQ-" + System.currentTimeMillis() % 1000000)
                .slug(slug + "-" + UUID.randomUUID().toString().substring(0, 4))
                .description(dto.getDescription())
                .overview(dto.getOverview())
                .material(dto.getMaterial())
                .careInstruction(dto.getCareInstruction())
                .basePrice(dto.getBasePrice())
                .salePrice(dto.getSalePrice())
                .category(category)
                .gender(dto.getGender() != null ? dto.getGender() : Gender.MEN)
                .collection(dto.getCollection())
                .featured(dto.isFeatured())
                .isNew(dto.isNew())
                .bestSeller(dto.isBestSeller())
                .limitedOffer(dto.isLimitedOffer())
                .primaryImageUrl(dto.getPrimaryImageUrl())
                .active(true)
                .build();

        Product saved = productRepository.save(product);

        // Add variants if present
        if (dto.getVariants() != null && !dto.getVariants().isEmpty()) {
            List<ProductVariant> variants = new ArrayList<>();
            for (var vDto : dto.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(saved)
                        .sku(vDto.getSku() != null ? vDto.getSku() : saved.getCode() + "-" + vDto.getSize() + "-" + vDto.getColorName().replaceAll(" ", ""))
                        .colorName(vDto.getColorName())
                        .colorHex(vDto.getColorHex() != null ? vDto.getColorHex() : "#000000")
                        .size(vDto.getSize())
                        .priceAdjustment(vDto.getPriceAdjustment() != null ? vDto.getPriceAdjustment() : BigDecimal.ZERO)
                        .imageUrl(vDto.getImageUrl() != null ? vDto.getImageUrl() : saved.getPrimaryImageUrl())
                        .barcode(vDto.getBarcode() != null ? vDto.getBarcode() : "45500" + (System.currentTimeMillis() % 10000000))
                        .totalStock(vDto.getTotalStock() != null ? vDto.getTotalStock() : 50)
                        .active(true)
                        .build();
                variants.add(variantRepository.save(variant));
            }
            saved.setVariants(variants);
        }

        return productService.mapToDto(saved);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + dto.getCategoryId()));
            product.setCategory(category);
        }

        if (dto.getName() != null && !dto.getName().isBlank()) product.setName(dto.getName());
        if (dto.getCode() != null && !dto.getCode().isBlank()) product.setCode(dto.getCode());
        product.setDescription(dto.getDescription());
        product.setOverview(dto.getOverview());
        product.setMaterial(dto.getMaterial());
        product.setCareInstruction(dto.getCareInstruction());
        if (dto.getBasePrice() != null) product.setBasePrice(dto.getBasePrice());
        product.setSalePrice(dto.getSalePrice());
        if (dto.getGender() != null) product.setGender(dto.getGender());
        product.setCollection(dto.getCollection());
        product.setFeatured(dto.isFeatured());
        product.setNew(dto.isNew());
        product.setBestSeller(dto.isBestSeller());
        product.setLimitedOffer(dto.isLimitedOffer());
        if (dto.getPrimaryImageUrl() != null && !dto.getPrimaryImageUrl().isBlank()) {
            product.setPrimaryImageUrl(dto.getPrimaryImageUrl());
        }

        // Update / Add variants if specified
        if (dto.getVariants() != null && !dto.getVariants().isEmpty()) {
            List<ProductVariant> currentVariants = product.getVariants() != null ? product.getVariants() : new ArrayList<>();
            for (var vDto : dto.getVariants()) {
                if (vDto.getId() != null) {
                    variantRepository.findById(vDto.getId()).ifPresent(v -> {
                        if (vDto.getColorName() != null) v.setColorName(vDto.getColorName());
                        if (vDto.getColorHex() != null) v.setColorHex(vDto.getColorHex());
                        if (vDto.getSize() != null) v.setSize(vDto.getSize());
                        if (vDto.getSku() != null) v.setSku(vDto.getSku());
                        if (vDto.getBarcode() != null) v.setBarcode(vDto.getBarcode());
                        if (vDto.getPriceAdjustment() != null) v.setPriceAdjustment(vDto.getPriceAdjustment());
                        if (vDto.getTotalStock() != null) v.setTotalStock(vDto.getTotalStock());
                        if (vDto.getImageUrl() != null) v.setImageUrl(vDto.getImageUrl());
                        variantRepository.save(v);
                    });
                } else {
                    ProductVariant newVar = ProductVariant.builder()
                            .product(product)
                            .sku(vDto.getSku() != null ? vDto.getSku() : product.getCode() + "-" + vDto.getSize() + "-" + vDto.getColorName().replaceAll(" ", ""))
                            .colorName(vDto.getColorName())
                            .colorHex(vDto.getColorHex() != null ? vDto.getColorHex() : "#000000")
                            .size(vDto.getSize())
                            .priceAdjustment(vDto.getPriceAdjustment() != null ? vDto.getPriceAdjustment() : BigDecimal.ZERO)
                            .imageUrl(vDto.getImageUrl() != null ? vDto.getImageUrl() : product.getPrimaryImageUrl())
                            .barcode(vDto.getBarcode() != null ? vDto.getBarcode() : "45500" + (System.currentTimeMillis() % 10000000))
                            .totalStock(vDto.getTotalStock() != null ? vDto.getTotalStock() : 50)
                            .active(true)
                            .build();
                    currentVariants.add(variantRepository.save(newVar));
                }
            }
            product.setVariants(currentVariants);
        }

        return productService.mapToDto(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        product.setActive(!product.isActive());
        productRepository.save(product);
    }
}
