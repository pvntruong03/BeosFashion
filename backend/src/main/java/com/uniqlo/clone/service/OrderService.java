package com.uniqlo.clone.service;

import com.uniqlo.clone.dto.*;
import com.uniqlo.clone.entity.*;
import com.uniqlo.clone.exception.BadRequestException;
import com.uniqlo.clone.exception.ResourceNotFoundException;
import com.uniqlo.clone.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final InventoryRepository inventoryRepository;
    private final CouponService couponService;
    private final CartService cartService;
    private final VietQrService vietQrService;

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("500000");
    private static final BigDecimal STANDARD_SHIPPING_FEE = new BigDecimal("30000");

    @Transactional
    public OrderDto createCheckoutOrder(Long userId, String sessionId, CheckoutRequest request) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
        Store store = request.getStoreId() != null ? storeRepository.findById(request.getStoreId()).orElse(null) : null;

        List<CartItemDto> checkoutItems = new ArrayList<>();

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (CheckoutRequest.CheckoutItemRequest itemReq : request.getItems()) {
                ProductVariant variant = variantRepository.findById(itemReq.getVariantId())
                        .orElseThrow(() -> new ResourceNotFoundException("Variant not found: " + itemReq.getVariantId()));
                Product product = variant.getProduct();
                BigDecimal price = (product.getSalePrice() != null ? product.getSalePrice() : product.getBasePrice())
                        .add(variant.getPriceAdjustment());

                checkoutItems.add(CartItemDto.builder()
                        .variantId(variant.getId())
                        .productId(product.getId())
                        .productName(product.getName())
                        .productCode(product.getCode())
                        .colorName(variant.getColorName())
                        .colorHex(variant.getColorHex())
                        .size(variant.getSize())
                        .imageUrl(variant.getImageUrl() != null ? variant.getImageUrl() : product.getPrimaryImageUrl())
                        .unitPrice(price)
                        .quantity(itemReq.getQuantity())
                        .subTotal(price.multiply(BigDecimal.valueOf(itemReq.getQuantity())))
                        .availableStock(variant.getTotalStock())
                        .build());
            }
        } else {
            CartDto cartDto = cartService.getOrCreateCart(userId, sessionId);
            if (cartDto.getItems() == null || cartDto.getItems().isEmpty()) {
                throw new BadRequestException("Cannot checkout with an empty cart");
            }
            checkoutItems = cartDto.getItems();
        }

        BigDecimal subTotal = BigDecimal.ZERO;
        for (CartItemDto item : checkoutItems) {
            subTotal = subTotal.add(item.getSubTotal());
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            CouponDto couponDto = couponService.validateCoupon(
                    CouponValidateRequest.builder().code(request.getCouponCode()).orderAmount(subTotal).build()
            );
            discountAmount = couponDto.getCalculatedDiscount();
            couponService.incrementUsedCount(request.getCouponCode());
        }

        BigDecimal shippingFee = BigDecimal.ZERO;
        if (request.getOrderType() == OrderType.ONLINE_DELIVERY) {
            shippingFee = subTotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : STANDARD_SHIPPING_FEE;
        }

        BigDecimal finalAmount = subTotal.subtract(discountAmount).add(shippingFee);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        String orderNumber = "UQ-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd")) + "-" +
                UUID.randomUUID().toString().substring(0, 5).toUpperCase();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .store(store)
                .orderType(request.getOrderType())
                .status(OrderStatus.PENDING)
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .customerEmail(request.getCustomerEmail())
                .shippingAddress(request.getShippingAddress())
                .shippingCity(request.getShippingCity())
                .subTotal(subTotal)
                .discountAmount(discountAmount)
                .shippingFee(shippingFee)
                .finalAmount(finalAmount)
                .couponCode(request.getCouponCode())
                .notes(request.getNotes())
                .build();

        order = orderRepository.save(order);

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItemDto item : checkoutItems) {
            ProductVariant variant = variantRepository.findById(item.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Variant not found: " + item.getVariantId()));

            // Deduct overall stock
            int updatedStock = variant.getTotalStock() - item.getQuantity();
            variant.setTotalStock(Math.max(updatedStock, 0));
            variantRepository.save(variant);

            // Deduct store inventory if specific store is linked
            if (store != null) {
                inventoryRepository.findByStoreIdAndProductVariantId(store.getId(), variant.getId())
                        .ifPresent(inv -> {
                            inv.setQuantity(Math.max(inv.getQuantity() - item.getQuantity(), 0));
                            inventoryRepository.save(inv);
                        });
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .variant(variant)
                    .productName(item.getProductName())
                    .productCode(item.getProductCode())
                    .color(item.getColorName())
                    .size(item.getSize())
                    .imageUrl(item.getImageUrl())
                    .unitPrice(item.getUnitPrice())
                    .quantity(item.getQuantity())
                    .subTotal(item.getSubTotal())
                    .build();

            orderItems.add(orderItemRepository.save(orderItem));
        }

        order.setItems(orderItems);

        // Payment record
        PaymentStatus initialPaymentStatus = (request.getPaymentMethod() == PaymentMethod.COD ||
                request.getPaymentMethod() == PaymentMethod.BANK_TRANSFER)
                ? PaymentStatus.PENDING : PaymentStatus.SUCCESS;

        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(initialPaymentStatus)
                .transactionId("TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase())
                .amount(finalAmount)
                .paymentTime(initialPaymentStatus == PaymentStatus.SUCCESS ? LocalDateTime.now() : null)
                .build();

        payment = paymentRepository.save(payment);
        order.setPayment(payment);

        // Remove purchased items from cart
        List<Long> purchasedVariantIds = checkoutItems.stream()
                .map(CartItemDto::getVariantId)
                .collect(Collectors.toList());
        cartService.removePurchasedItems(userId, sessionId, purchasedVariantIds);

        return mapToDto(order);
    }

    @Transactional
    public OrderDto createPosOrder(Long staffUserId, PosOrderRequest request) {
        Store store = null;
        if (request.getStoreId() != null) {
            store = storeRepository.findById(request.getStoreId()).orElse(null);
        }

        BigDecimal subTotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        String orderNumber = "POS-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd")) + "-" +
                UUID.randomUUID().toString().substring(0, 5).toUpperCase();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .store(store)
                .orderType(OrderType.POS_IN_STORE)
                .status(OrderStatus.COMPLETED)
                .customerName(request.getCustomerName() != null && !request.getCustomerName().isBlank() ? request.getCustomerName() : "Khách tại quầy")
                .customerPhone(request.getCustomerPhone() != null ? request.getCustomerPhone() : "")
                .shippingAddress(store != null ? store.getName() + " - " + store.getAddress() : "Tại quầy")
                .subTotal(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .shippingFee(BigDecimal.ZERO)
                .finalAmount(BigDecimal.ZERO)
                .notes(request.getNotes())
                .build();

        order = orderRepository.save(order);

        for (PosOrderRequest.PosItem itemReq : request.getItems()) {
            ProductVariant variant = variantRepository.findById(itemReq.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Variant not found: " + itemReq.getVariantId()));
            Product product = variant.getProduct();

            BigDecimal unitPrice = itemReq.getCustomPrice() != null ? itemReq.getCustomPrice() :
                    (product.getSalePrice() != null ? product.getSalePrice() : product.getBasePrice()).add(variant.getPriceAdjustment());

            BigDecimal itemSubTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subTotal = subTotal.add(itemSubTotal);

            // Deduct variant total stock & store inventory
            variant.setTotalStock(Math.max(variant.getTotalStock() - itemReq.getQuantity(), 0));
            variantRepository.save(variant);

            if (store != null) {
                inventoryRepository.findByStoreIdAndProductVariantId(store.getId(), variant.getId())
                        .ifPresent(inv -> {
                            inv.setQuantity(Math.max(inv.getQuantity() - itemReq.getQuantity(), 0));
                            inventoryRepository.save(inv);
                        });
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .variant(variant)
                    .productName(product.getName())
                    .productCode(product.getCode())
                    .color(variant.getColorName())
                    .size(variant.getSize())
                    .imageUrl(variant.getImageUrl() != null ? variant.getImageUrl() : product.getPrimaryImageUrl())
                    .unitPrice(unitPrice)
                    .quantity(itemReq.getQuantity())
                    .subTotal(itemSubTotal)
                    .build();

            orderItems.add(orderItemRepository.save(orderItem));
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            CouponDto couponDto = couponService.validateCoupon(
                    CouponValidateRequest.builder().code(request.getCouponCode()).orderAmount(subTotal).build()
            );
            discountAmount = couponDto.getCalculatedDiscount();
            couponService.incrementUsedCount(request.getCouponCode());
        }

        BigDecimal finalAmount = subTotal.subtract(discountAmount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        order.setSubTotal(subTotal);
        order.setDiscountAmount(discountAmount);
        order.setFinalAmount(finalAmount);
        order.setCouponCode(request.getCouponCode());
        order.setItems(orderItems);

        // Payment record
        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.SUCCESS)
                .transactionId("POS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .amount(finalAmount)
                .paymentTime(LocalDateTime.now())
                .paymentDetails(request.getCashTendered() != null ? "Cash tendered: " + request.getCashTendered() : "")
                .build();

        payment = paymentRepository.save(payment);
        order.setPayment(payment);

        return mapToDto(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getMyOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));
        return mapToDto(order);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return mapToDto(order);
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setStatus(request.getStatus());
        if (request.getTrackingNumber() != null && !request.getTrackingNumber().isBlank()) {
            order.setTrackingNumber(request.getTrackingNumber());
        }
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            order.setNotes(order.getNotes() != null ? order.getNotes() + "\n" + request.getNotes() : request.getNotes());
        }

        if (request.getStatus() == OrderStatus.DELIVERED || request.getStatus() == OrderStatus.COMPLETED) {
            if (order.getPayment() != null && order.getPayment().getPaymentStatus() == PaymentStatus.PENDING) {
                order.getPayment().setPaymentStatus(PaymentStatus.SUCCESS);
                order.getPayment().setPaymentTime(LocalDateTime.now());
                paymentRepository.save(order.getPayment());
            }
        }

        return mapToDto(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getOrdersByStoreId(Long storeId) {
        return orderRepository.findByStoreIdOrderByCreatedAtDesc(storeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> getAllOrders(Pageable pageable) {
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::mapToDto);
    }

    public OrderDto mapToDto(Order order) {
        List<OrderItemDto> itemDtos = order.getItems() != null ? order.getItems().stream().map(item -> OrderItemDto.builder()
                .id(item.getId())
                .variantId(item.getVariant() != null ? item.getVariant().getId() : null)
                .productName(item.getProductName())
                .productCode(item.getProductCode())
                .color(item.getColor())
                .size(item.getSize())
                .imageUrl(item.getImageUrl())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .subTotal(item.getSubTotal())
                .build()).collect(Collectors.toList()) : List.of();

        VietQrService.VietQrDetails qrDetails = vietQrService != null ? vietQrService.generateQrDetails(order) : null;

        OrderDto.PaymentInfoDto paymentDto = null;
        if (order.getPayment() != null) {
            Payment p = order.getPayment();
            paymentDto = OrderDto.PaymentInfoDto.builder()
                    .id(p.getId())
                    .paymentMethod(p.getPaymentMethod())
                    .paymentStatus(p.getPaymentStatus())
                    .transactionId(p.getTransactionId())
                    .amount(p.getAmount())
                    .paymentTime(p.getPaymentTime())
                    .paymentDetails(p.getPaymentDetails())
                    .qrPaymentUrl(qrDetails != null ? qrDetails.getQrImageUrl() : null)
                    .build();
        }

        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .storeId(order.getStore() != null ? order.getStore().getId() : null)
                .storeName(order.getStore() != null ? order.getStore().getName() : null)
                .orderType(order.getOrderType())
                .status(order.getStatus())
                .customerName(order.getCustomerName())
                .customerPhone(order.getCustomerPhone())
                .customerEmail(order.getCustomerEmail())
                .shippingAddress(order.getShippingAddress())
                .shippingCity(order.getShippingCity())
                .trackingNumber(order.getTrackingNumber())
                .subTotal(order.getSubTotal())
                .discountAmount(order.getDiscountAmount())
                .shippingFee(order.getShippingFee())
                .finalAmount(order.getFinalAmount())
                .couponCode(order.getCouponCode())
                .notes(order.getNotes())
                .payment(paymentDto)
                .vietQr(qrDetails)
                .items(itemDtos)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
