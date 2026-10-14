package com.beofashion.repository;

import com.beofashion.entity.Gender;
import com.beofashion.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySlug(String slug);
    Optional<Product> findByCode(String code);
    List<Product> findByActiveTrue();

    List<Product> findByFeaturedTrueAndActiveTrue();
    List<Product> findByIsNewTrueAndActiveTrue();
    List<Product> findByBestSellerTrueAndActiveTrue();
    List<Product> findByLimitedOfferTrueAndActiveTrue();
    Page<Product> findByActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    List<Product> findByGenderAndActiveTrue(Gender gender);
    List<Product> findByCategoryIdAndActiveTrue(Long categoryId);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.code) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.collection) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.material) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Product> searchProducts(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.id <> :excludeId AND p.active = true")
    List<Product> findRelatedProducts(@Param("categoryId") Long categoryId, @Param("excludeId") Long excludeId, Pageable pageable);
}
