package com.beofashion.repository;

import com.beofashion.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdAndApprovedTrueOrderByCreatedAtDesc(Long productId);
    List<Review> findByProductId(Long productId);
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
}
