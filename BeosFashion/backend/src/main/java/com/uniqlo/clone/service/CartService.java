package com.uniqlo.clone.service;

import com.uniqlo.clone.dto.CartDto;
import com.uniqlo.clone.dto.CartItemDto;
import com.uniqlo.clone.dto.CartItemRequest;
import com.uniqlo.clone.entity.*;
import com.uniqlo.clone.exception.BadRequestException;
import com.uniqlo.clone.exception.ResourceNotFoundException;
import com.uniqlo.clone.repository.CartItemRepository;
import com.uniqlo.clone.repository.CartRepository;
import com.uniqlo.clone.repository.ProductVariantRepository;
import com.uniqlo.clone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("500000"); // 500k VND
    private static final BigDecimal STANDARD_SHIPPING_FEE = new BigDecimal("30000"); // 30k VND

    @Transactional
    public CartDto getOrCreateCart(Long userId, String sessionId) {
        Cart cart = findOrCreateCartEntity(userId, sessionId);
        return mapToDto(cart);
    }

    @Transactional
    public CartDto addItemToCart(Long userId, CartItemRequest request) {
        Cart cart = findOrCreateCartEntity(userId, request.getSessionId());

        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found with id: " + request.getVariantId()));

        if (!variant.isActive() || !variant.getProduct().isActive()) {
            throw new BadRequestException("Product is currently unavailable");
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variant.getId());

        if (existingItemOpt.isPresent()) {
            CartItem item = existingItemOpt.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (newQuantity > variant.getTotalStock()) {
                throw new BadRequestException("Requested quantity exceeds available stock (" + variant.getTotalStock() + ")");
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            if (request.getQuantity() > variant.getTotalStock()) {
                throw new BadRequestException("Requested quantity exceeds available stock (" + variant.getTotalStock() + ")");
            }
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .variant(variant)
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        return mapToDto(cartRepository.save(cart));
    }

    @Transactional
    public CartDto updateItemQuantity(Long userId, String sessionId, Long itemId, int quantity) {
        Cart cart = findOrCreateCartEntity(userId, sessionId);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to current cart");
        }

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            if (quantity > item.getVariant().getTotalStock()) {
                throw new BadRequestException("Requested quantity exceeds available stock (" + item.getVariant().getTotalStock() + ")");
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return mapToDto(cartRepository.save(cart));
    }

    @Transactional
    public CartDto removeItemFromCart(Long userId, String sessionId, Long itemId) {
        Cart cart = findOrCreateCartEntity(userId, sessionId);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to current cart");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return mapToDto(cartRepository.save(cart));
    }

    @Transactional
    public void clearCart(Long cartId) {
        cartItemRepository.deleteByCartId(cartId);
    }

    private Cart findOrCreateCartEntity(Long userId, String sessionId) {
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                return cartRepository.findByUser(user)
                        .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
            }
        }

        if (sessionId != null && !sessionId.isBlank()) {
            return cartRepository.findBySessionId(sessionId)
                    .orElseGet(() -> cartRepository.save(Cart.builder().sessionId(sessionId).build()));
        }

        return cartRepository.save(Cart.builder().build());
    }

    public CartDto mapToDto(Cart cart) {
        List<CartItemDto> itemDtos = new ArrayList<>();
        BigDecimal subTotal = BigDecimal.ZERO;
        int totalQty = 0;

        if (cart.getItems() != null) {
            for (CartItem item : cart.getItems()) {
                ProductVariant variant = item.getVariant();
                Product product = variant.getProduct();
                BigDecimal price = (product.getSalePrice() != null ? product.getSalePrice() : product.getBasePrice())
                        .add(variant.getPriceAdjustment());
                BigDecimal itemSubTotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));

                subTotal = subTotal.add(itemSubTotal);
                totalQty += item.getQuantity();

                itemDtos.add(CartItemDto.builder()
                        .id(item.getId())
                        .variantId(variant.getId())
                        .productId(product.getId())
                        .productName(product.getName())
                        .productCode(product.getCode())
                        .productSlug(product.getSlug())
                        .colorName(variant.getColorName())
                        .colorHex(variant.getColorHex())
                        .size(variant.getSize())
                        .imageUrl(variant.getImageUrl() != null ? variant.getImageUrl() : product.getPrimaryImageUrl())
                        .unitPrice(price)
                        .quantity(item.getQuantity())
                        .subTotal(itemSubTotal)
                        .availableStock(variant.getTotalStock())
                        .build());
            }
        }

        boolean eligibleForFreeShipping = subTotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0;
        BigDecimal estimatedShipping = eligibleForFreeShipping || totalQty == 0 ? BigDecimal.ZERO : STANDARD_SHIPPING_FEE;

        return CartDto.builder()
                .id(cart.getId())
                .userId(cart.getUser() != null ? cart.getUser().getId() : null)
                .sessionId(cart.getSessionId())
                .items(itemDtos)
                .totalQuantity(totalQty)
                .subTotal(subTotal)
                .estimatedShipping(estimatedShipping)
                .freeShippingThreshold(FREE_SHIPPING_THRESHOLD)
                .eligibleForFreeShipping(eligibleForFreeShipping)
                .build();
    }
}
