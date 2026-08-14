package com.uniqlo.clone.service;

import com.uniqlo.clone.dto.*;
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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final StoreRepository storeRepository;
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductVariantRepository variantRepository;
    private final StockTransferRepository stockTransferRepository;
    private final ReturnExchangeRepository returnExchangeRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;
    private final StoreService storeService;

    @Transactional(readOnly = true)
    public StoreDto getStaffStore(Long storeId) {
        if (storeId == null) {
            // Return default flagship store if not bound
            return storeService.getAllActiveStores().stream().findFirst().orElse(null);
        }
        return storeService.getStoreById(storeId);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getStoreOrders(Long storeId) {
        if (storeId == null) {
            return orderRepository.findAll().stream().map(orderService::mapToDto).collect(Collectors.toList());
        }
        return orderRepository.findByStoreIdOrderByCreatedAtDesc(storeId).stream()
                .map(orderService::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductVariantDto> getStoreInventory(Long storeId) {
        if (storeId == null) {
            return variantRepository.findAll().stream()
                    .map(this::mapVariantToStaffInventory)
                    .collect(Collectors.toList());
        }

        List<Inventory> storeInvs = inventoryRepository.findByStoreId(storeId);
        return storeInvs.stream().map(inv -> {
            ProductVariant v = inv.getProductVariant();
            Product p = v.getProduct();
            BigDecimal price = (p.getSalePrice() != null ? p.getSalePrice() : p.getBasePrice()).add(v.getPriceAdjustment());

            return ProductVariantDto.builder()
                    .id(v.getId())
                    .productId(p.getId())
                    .sku(v.getSku())
                    .colorName(v.getColorName())
                    .colorHex(v.getColorHex())
                    .size(v.getSize())
                    .priceAdjustment(v.getPriceAdjustment())
                    .effectivePrice(price)
                    .imageUrl(v.getImageUrl() != null ? v.getImageUrl() : p.getPrimaryImageUrl())
                    .barcode(v.getBarcode())
                    .totalStock(inv.getQuantity())
                    .active(v.isActive())
                    .build();
        }).collect(Collectors.toList());
    }

    private ProductVariantDto mapVariantToStaffInventory(ProductVariant v) {
        Product p = v.getProduct();
        BigDecimal price = (p.getSalePrice() != null ? p.getSalePrice() : p.getBasePrice()).add(v.getPriceAdjustment());
        return ProductVariantDto.builder()
                .id(v.getId())
                .productId(p.getId())
                .sku(v.getSku())
                .colorName(v.getColorName())
                .colorHex(v.getColorHex())
                .size(v.getSize())
                .priceAdjustment(v.getPriceAdjustment())
                .effectivePrice(price)
                .imageUrl(v.getImageUrl() != null ? v.getImageUrl() : p.getPrimaryImageUrl())
                .barcode(v.getBarcode())
                .totalStock(v.getTotalStock())
                .active(v.isActive())
                .build();
    }

    @Transactional
    public ProductVariantDto adjustStoreInventory(Long storeId, StockAdjustmentRequest request) {
        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found: " + request.getVariantId()));

        if (storeId != null) {
            Store store = storeRepository.findById(storeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Store not found: " + storeId));

            Inventory inventory = inventoryRepository.findByStoreIdAndProductVariantId(storeId, request.getVariantId())
                    .orElseGet(() -> Inventory.builder().store(store).productVariant(variant).quantity(0).build());

            int diff = request.getNewQuantity() - inventory.getQuantity();
            inventory.setQuantity(request.getNewQuantity());
            inventoryRepository.save(inventory);

            // Adjust variant total stock
            variant.setTotalStock(Math.max(variant.getTotalStock() + diff, 0));
            variantRepository.save(variant);
        } else {
            variant.setTotalStock(request.getNewQuantity());
            variantRepository.save(variant);
        }

        return mapVariantToStaffInventory(variant);
    }

    @Transactional
    public StockTransferDto createStockTransfer(Long staffUserId, StockTransferDto dto) {
        Store fromStore = storeRepository.findById(dto.getFromStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("From store not found: " + dto.getFromStoreId()));
        Store toStore = storeRepository.findById(dto.getToStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("To store not found: " + dto.getToStoreId()));
        ProductVariant variant = variantRepository.findById(dto.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found: " + dto.getVariantId()));
        User requester = staffUserId != null ? userRepository.findById(staffUserId).orElse(null) : null;

        String requestCode = "TR-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd")) + "-" +
                UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        StockTransferRequest request = StockTransferRequest.builder()
                .requestCode(requestCode)
                .fromStore(fromStore)
                .toStore(toStore)
                .variant(variant)
                .quantity(dto.getQuantity())
                .status(TransferStatus.PENDING)
                .reason(dto.getReason())
                .requestedBy(requester)
                .build();

        return mapTransferToDto(stockTransferRepository.save(request));
    }

    @Transactional(readOnly = true)
    public List<StockTransferDto> getStoreTransfers(Long storeId) {
        if (storeId == null) {
            return stockTransferRepository.findAll().stream().map(this::mapTransferToDto).collect(Collectors.toList());
        }
        return stockTransferRepository.findByFromStoreIdOrToStoreIdOrderByCreatedAtDesc(storeId, storeId).stream()
                .map(this::mapTransferToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StaffDailyReportDto getDailyReport(Long storeId) {
        Store store = storeId != null ? storeRepository.findById(storeId).orElse(null) : null;
        String storeName = store != null ? store.getName() : "Toàn hệ thống";

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        BigDecimal todayRevenue = BigDecimal.ZERO;
        List<Order> storeOrders;

        if (storeId != null) {
            storeOrders = orderRepository.findByStoreIdOrderByCreatedAtDesc(storeId);
            todayRevenue = orderRepository.calculateStoreRevenueSince(storeId, startOfDay);
        } else {
            storeOrders = orderRepository.findAll();
            todayRevenue = orderRepository.calculateTotalRevenue();
        }

        long totalOrdersToday = storeOrders.stream().filter(o -> o.getCreatedAt().isAfter(startOfDay)).count();
        long posCount = storeOrders.stream().filter(o -> o.getOrderType() == OrderType.POS_IN_STORE && o.getCreatedAt().isAfter(startOfDay)).count();
        long onlineCount = storeOrders.stream().filter(o -> o.getOrderType() == OrderType.ONLINE_DELIVERY && o.getCreatedAt().isAfter(startOfDay)).count();
        long pendingPickup = storeOrders.stream().filter(o -> o.getOrderType() == OrderType.IN_STORE_PICKUP && o.getStatus() == OrderStatus.PENDING).count();

        List<Inventory> lowStockInvs = storeId != null ? inventoryRepository.findLowStockByStoreId(storeId) : inventoryRepository.findAllLowStock();

        return StaffDailyReportDto.builder()
                .storeId(storeId)
                .storeName(storeName)
                .reportDate(LocalDate.now().format(DateTimeFormatter.ISO_DATE))
                .todayRevenue(todayRevenue != null ? todayRevenue : BigDecimal.ZERO)
                .totalOrdersToday(totalOrdersToday)
                .posOrdersCount(posCount)
                .onlineFulfillmentCount(onlineCount)
                .pendingPickupOrders(pendingPickup)
                .lowStockVariantsCount((long) lowStockInvs.size())
                .recentStoreOrders(storeOrders.stream().limit(10).map(orderService::mapToDto).collect(Collectors.toList()))
                .build();
    }

    public StockTransferDto mapTransferToDto(StockTransferRequest req) {
        ProductVariant v = req.getVariant();
        Product p = v.getProduct();

        return StockTransferDto.builder()
                .id(req.getId())
                .requestCode(req.getRequestCode())
                .fromStoreId(req.getFromStore().getId())
                .fromStoreName(req.getFromStore().getName())
                .toStoreId(req.getToStore().getId())
                .toStoreName(req.getToStore().getName())
                .variantId(v.getId())
                .productName(p.getName())
                .productCode(p.getCode())
                .color(v.getColorName())
                .size(v.getSize())
                .quantity(req.getQuantity())
                .status(req.getStatus())
                .reason(req.getReason())
                .requesterName(req.getRequestedBy() != null ? req.getRequestedBy().getFullName() : null)
                .approverName(req.getApprovedBy() != null ? req.getApprovedBy().getFullName() : null)
                .createdAt(req.getCreatedAt())
                .build();
    }
}
