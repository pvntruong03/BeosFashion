package com.beofashion.repository;

import com.beofashion.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByStoreIdAndProductVariantId(Long storeId, Long variantId);
    List<Inventory> findByStoreId(Long storeId);
    List<Inventory> findByProductVariantId(Long variantId);

    @Query("SELECT i FROM Inventory i WHERE i.store.id = :storeId AND i.quantity <= i.lowStockThreshold")
    List<Inventory> findLowStockByStoreId(@Param("storeId") Long storeId);

    @Query("SELECT i FROM Inventory i WHERE i.quantity <= i.lowStockThreshold")
    List<Inventory> findAllLowStock();
}
