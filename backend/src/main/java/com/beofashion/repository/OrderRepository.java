package com.beofashion.repository;

import com.beofashion.entity.Order;
import com.beofashion.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Order> findByStoreIdOrderByCreatedAtDesc(Long storeId);
    List<Order> findByStoreIdAndStatus(Long storeId, OrderStatus status);
    List<Order> findByStatus(OrderStatus status);
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :since")
    long countOrdersSince(@Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o LEFT JOIN o.payment p " +
            "WHERE o.status NOT IN ('CANCELLED', 'RETURNED') AND " +
            "(p.paymentStatus = com.beofashion.entity.PaymentStatus.SUCCESS OR o.status IN ('DELIVERED', 'COMPLETED'))")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o LEFT JOIN o.payment p " +
            "WHERE o.store.id = :storeId AND o.createdAt >= :since AND o.status NOT IN ('CANCELLED', 'RETURNED') AND " +
            "(p.paymentStatus = com.beofashion.entity.PaymentStatus.SUCCESS OR o.status IN ('DELIVERED', 'COMPLETED'))")
    BigDecimal calculateStoreRevenueSince(@Param("storeId") Long storeId, @Param("since") LocalDateTime since);
}
