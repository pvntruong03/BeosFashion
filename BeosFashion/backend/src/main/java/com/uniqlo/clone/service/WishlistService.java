package com.uniqlo.clone.service;

import com.uniqlo.clone.dto.ProductDto;
import com.uniqlo.clone.entity.Product;
import com.uniqlo.clone.entity.User;
import com.uniqlo.clone.entity.Wishlist;
import com.uniqlo.clone.exception.ResourceNotFoundException;
import com.uniqlo.clone.repository.ProductRepository;
import com.uniqlo.clone.repository.UserRepository;
import com.uniqlo.clone.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public List<ProductDto> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(Wishlist::getProduct)
                .map(productService::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public boolean toggleWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            wishlistRepository.deleteByUserIdAndProductId(userId, productId);
            return false; // Removed
        } else {
            wishlistRepository.save(Wishlist.builder().user(user).product(product).build());
            return true; // Added
        }
    }

    @Transactional(readOnly = true)
    public boolean isProductInWishlist(Long userId, Long productId) {
        if (userId == null) return false;
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }
}
