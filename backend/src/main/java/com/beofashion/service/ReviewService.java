package com.beofashion.service;

import com.beofashion.dto.ReviewDto;
import com.beofashion.dto.ReviewRequest;
import com.beofashion.entity.Product;
import com.beofashion.entity.Review;
import com.beofashion.entity.User;
import com.beofashion.exception.ResourceNotFoundException;
import com.beofashion.repository.ProductRepository;
import com.beofashion.repository.ReviewRepository;
import com.beofashion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ReviewDto> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdAndApprovedTrueOrderByCreatedAtDesc(productId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto createReview(Long userId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.getProductId()));

        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(request.getRating())
                .title(request.getTitle())
                .comment(request.getComment())
                .fitRating(request.getFitRating())
                .purchasedSize(request.getPurchasedSize())
                .purchasedColor(request.getPurchasedColor())
                .verifiedPurchase(true)
                .approved(true)
                .build();

        review = reviewRepository.save(review);

        // Update product average rating & review count
        List<Review> approvedReviews = reviewRepository.findByProductIdAndApprovedTrueOrderByCreatedAtDesc(product.getId());
        double avg = approvedReviews.stream().mapToInt(Review::getRating).average().orElse(5.0);
        product.setAverageRating(Math.round(avg * 10.0) / 10.0);
        product.setReviewCount(approvedReviews.size());
        productRepository.save(product);

        return mapToDto(review);
    }

    public ReviewDto mapToDto(Review review) {
        return ReviewDto.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .userId(review.getUser().getId())
                .userName(review.getUser().getFullName())
                .userAvatar(review.getUser().getAvatar())
                .rating(review.getRating())
                .title(review.getTitle())
                .comment(review.getComment())
                .fitRating(review.getFitRating())
                .purchasedSize(review.getPurchasedSize())
                .purchasedColor(review.getPurchasedColor())
                .verifiedPurchase(review.isVerifiedPurchase())
                .approved(review.isApproved())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
