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
        Store store = request.getStoreId() != null 
                ? storeRepository.findById(request.getStoreId()).orElse(null) 
                : storeRepository.findAll().stream().findFirst().orElse(null);

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
                .items(new ArrayList<>())
                .build();

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

            order.getItems().add(orderItem);
        }

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

        order.setPayment(payment);

        Order savedOrder = orderRepository.save(order);

        // Remove purchased items from cart
        List<Long> purchasedVariantIds = checkoutItems.stream()
                .map(CartItemDto::getVariantId)
                .collect(Collectors.toList());
        cartService.removePurchasedItems(userId, sessionId, purchasedVariantIds);

        return mapToDto(savedOrder);
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

        OrderStatus oldStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();

        if (oldStatus == OrderStatus.CANCELLED) {
            throw new BadRequestException("Đơn hàng đã hủy, không thể thay đổi trạng thái!");
        }

        // If cancelling order, restore inventory
        if (newStatus == OrderStatus.CANCELLED && oldStatus != OrderStatus.CANCELLED) {
            restoreOrderInventory(order);
        }

        order.setStatus(newStatus);
        if (request.getTrackingNumber() != null && !request.getTrackingNumber().isBlank()) {
            order.setTrackingNumber(request.getTrackingNumber());
        }
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            order.setNotes(order.getNotes() != null ? order.getNotes() + "\n" + request.getNotes() : request.getNotes());
        }

        if (newStatus == OrderStatus.DELIVERED || newStatus == OrderStatus.COMPLETED) {
            if (order.getPayment() != null && order.getPayment().getPaymentStatus() == PaymentStatus.PENDING) {
                order.getPayment().setPaymentStatus(PaymentStatus.SUCCESS);
                order.getPayment().setPaymentTime(LocalDateTime.now());
                paymentRepository.save(order.getPayment());
            }
        } else if (newStatus == OrderStatus.CANCELLED) {
            if (order.getPayment() != null && order.getPayment().getPaymentStatus() == PaymentStatus.PENDING) {
                order.getPayment().setPaymentStatus(PaymentStatus.FAILED);
                paymentRepository.save(order.getPayment());
            }
        }

        return mapToDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto cancelOrder(Long orderId, Long userId, boolean isStaffOrAdmin, String cancelReason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Security check: if not staff/admin, customer can only cancel their own order
        if (!isStaffOrAdmin) {
            if (order.getUser() == null || !order.getUser().getId().equals(userId)) {
                throw new BadRequestException("Bạn không có quyền hủy đơn hàng này!");
            }
            if (order.getStatus() != OrderStatus.PENDING) {
                throw new BadRequestException("Đơn hàng đã được xác nhận thành công (hoặc đang đóng gói/vận chuyển), không thể tự hủy. Quý khách vui lòng liên hệ Hotline BEO 1900019199999 để được hỗ trợ!");
            }
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Đơn hàng này đã được hủy trước đó!");
        }

        if (order.getStatus() == OrderStatus.SHIPPING || order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.COMPLETED) {
            throw new BadRequestException("Đơn hàng đang giao hoặc đã hoàn thành, không thể hủy!");
        }

        // Restore inventory
        restoreOrderInventory(order);

        order.setStatus(OrderStatus.CANCELLED);
        String reason = cancelReason != null && !cancelReason.isBlank() ? cancelReason : "Khách hàng yêu cầu hủy đơn";
        order.setNotes(order.getNotes() != null ? order.getNotes() + "\n[ĐÃ HỦY]: " + reason : "[ĐÃ HỦY]: " + reason);

        if (order.getPayment() != null && order.getPayment().getPaymentStatus() == PaymentStatus.PENDING) {
            order.getPayment().setPaymentStatus(PaymentStatus.FAILED);
            paymentRepository.save(order.getPayment());
        }

        return mapToDto(orderRepository.save(order));
    }

    private void restoreOrderInventory(Order order) {
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                if (item.getVariant() != null) {
                    ProductVariant variant = item.getVariant();
                    variant.setTotalStock(variant.getTotalStock() + item.getQuantity());
                    variantRepository.save(variant);

                    if (order.getStore() != null) {
                        inventoryRepository.findByStoreIdAndProductVariantId(order.getStore().getId(), variant.getId())
                                .ifPresent(inv -> {
                                    inv.setQuantity(inv.getQuantity() + item.getQuantity());
                                    inventoryRepository.save(inv);
                                });
                    }
                }
            }
        }

        // Restore coupon usage quota if coupon was used
        if (order.getCouponCode() != null && !order.getCouponCode().isBlank()) {
            couponService.decrementUsedCount(order.getCouponCode());
        }
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
