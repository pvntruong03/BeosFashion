package com.beofashion.service;

import com.beofashion.dto.AdminDashboardStatsDto;
import com.beofashion.dto.ProductDto;
import com.beofashion.entity.*;
import com.beofashion.exception.BadRequestException;
import com.beofashion.exception.ResourceNotFoundException;
import com.beofashion.repository.*;
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
        List<Order> allOrders = orderRepository.findAll();
        List<Order> validOrders = allOrders.stream().filter(this::isValidOrder).toList();
        List<Order> paidOrders = validOrders.stream().filter(this::isRecognizedRevenue).toList();
        BigDecimal totalRevenue = sumRevenue(paidOrders);
        long totalOrders = validOrders.size();
        long totalCustomers = userRepository.count();
        long activeCustomers = userRepository.findAll().stream().filter(User::isEnabled).count();
        long totalProducts = productRepository.findByActiveTrue().size();
        long paidOrdersCount = paidOrders.size();
        long pendingOrders = orderRepository.findByStatus(OrderStatus.PENDING).size();
        long lowStockCount = inventoryRepository.findAllLowStock().size();

        LocalDate today = LocalDate.now();
        LocalDateTime currentPeriodStart = today.minusDays(6).atStartOfDay();
        LocalDateTime currentPeriodEnd = today.plusDays(1).atStartOfDay();
        LocalDateTime previousPeriodStart = currentPeriodStart.minusDays(7);
        BigDecimal currentPeriodRevenue = sumRevenue(paidOrders.stream()
                .filter(order -> isInPeriod(revenueDate(order), currentPeriodStart, currentPeriodEnd))
                .toList());
        BigDecimal previousPeriodRevenue = sumRevenue(paidOrders.stream()
                .filter(order -> isInPeriod(revenueDate(order), previousPeriodStart, currentPeriodStart))
                .toList());
        BigDecimal revenueChangePercent = previousPeriodRevenue.signum() > 0
                ? currentPeriodRevenue.subtract(previousPeriodRevenue)
                .multiply(BigDecimal.valueOf(100))
                .divide(previousPeriodRevenue, 1, java.math.RoundingMode.HALF_UP)
                : null;

        List<AdminDashboardStatsDto.DailyRevenueDto> dailyRevenueList = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.plusDays(1).atStartOfDay();

            List<Order> dayOrders = paidOrders.stream()
                    .filter(o -> isInPeriod(revenueDate(o), start, end))
                    .toList();

            BigDecimal dayRev = sumRevenue(dayOrders);
            dailyRevenueList.add(AdminDashboardStatsDto.DailyRevenueDto.builder()
                    .date(date.format(DateTimeFormatter.ofPattern("dd/MM")))
                    .revenue(dayRev)
                    .orderCount((long) dayOrders.size())
                    .build());
        }

        Map<Long, Long> productSalesCount = new HashMap<>();
        Map<Long, BigDecimal> productSalesRevenue = new HashMap<>();

        for (Order o : paidOrders) {
            if (o.getItems() != null) {
                for (OrderItem item : o.getItems()) {
                    if (item.getVariant() != null && item.getVariant().getProduct() != null) {
                        Long pId = item.getVariant().getProduct().getId();
                        productSalesCount.put(pId, productSalesCount.getOrDefault(pId, 0L) + item.getQuantity());
                        productSalesRevenue.put(pId, productSalesRevenue.getOrDefault(pId, BigDecimal.ZERO).add(item.getSubTotal()));
                    }
                }
            }
        }

        List<AdminDashboardStatsDto.TopSellingProductDto> topSelling = productSalesCount.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .limit(5)
                .map(e -> {
                    Product p = productRepository.findById(e.getKey()).orElse(null);
                    if (p == null) return null;
                    return AdminDashboardStatsDto.TopSellingProductDto.builder()
                            .productId(p.getId())
                            .name(p.getName())
                            .code(p.getCode())
                            .imageUrl(p.getPrimaryImageUrl())
                            .price(p.getSalePrice() != null ? p.getSalePrice() : p.getBasePrice())
                            .totalSold(e.getValue())
                            .totalRevenue(productSalesRevenue.getOrDefault(p.getId(), BigDecimal.ZERO))
                            .build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<Store> stores = storeRepository.findByActiveTrue();
        List<AdminDashboardStatsDto.StoreSalesDto> storeSales = stores.stream()
                .map(s -> {
                    List<Order> sOrders = paidOrders.stream().filter(order -> order.getStore() != null
                            && s.getId().equals(order.getStore().getId())).toList();
                    BigDecimal rev = sumRevenue(sOrders);
                    return AdminDashboardStatsDto.StoreSalesDto.builder()
                            .storeId(s.getId())
                            .storeName(s.getName())
                            .storeCode(s.getCode())
                            .totalRevenue(rev)
                            .orderCount((long) sOrders.size())
                            .build();
                }).collect(Collectors.toList());

        return AdminDashboardStatsDto.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .activeCustomers(activeCustomers)
                .totalProducts(totalProducts)
                .paidOrdersCount(paidOrdersCount)
                .pendingOrdersCount(pendingOrders)
                .lowStockItemsCount(lowStockCount)
                .previousPeriodRevenue(previousPeriodRevenue)
                .revenueChangePercent(revenueChangePercent)
                .revenueLast7Days(dailyRevenueList)
                .topSellingProducts(topSelling)
                .storeSalesComparison(storeSales)
                .build();
    }

    private boolean isValidOrder(Order order) {
        return order != null && order.getStatus() != OrderStatus.CANCELLED && order.getStatus() != OrderStatus.RETURNED;
    }

    private boolean isRecognizedRevenue(Order order) {
        return isValidOrder(order) && (order.getStatus() == OrderStatus.DELIVERED
                || order.getStatus() == OrderStatus.COMPLETED
                || (order.getPayment() != null && order.getPayment().getPaymentStatus() == PaymentStatus.SUCCESS));
    }

    private LocalDateTime revenueDate(Order order) {
        return order.getPayment() != null && order.getPayment().getPaymentTime() != null
                ? order.getPayment().getPaymentTime()
                : order.getCreatedAt();
    }

    private boolean isInPeriod(LocalDateTime date, LocalDateTime start, LocalDateTime end) {
        return date != null && !date.isBefore(start) && date.isBefore(end);
    }

    private BigDecimal sumRevenue(List<Order> orders) {
        return orders.stream().map(Order::getFinalAmount).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
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
                .code(dto.getCode() != null ? dto.getCode() : "BEO-" + System.currentTimeMillis() % 1000000)
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
