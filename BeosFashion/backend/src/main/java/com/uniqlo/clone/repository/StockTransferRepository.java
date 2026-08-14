package com.uniqlo.clone.repository;

import com.uniqlo.clone.entity.StockTransferRequest;
import com.uniqlo.clone.entity.TransferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockTransferRepository extends JpaRepository<StockTransferRequest, Long> {
    List<StockTransferRequest> findByFromStoreIdOrToStoreIdOrderByCreatedAtDesc(Long fromStoreId, Long toStoreId);
    List<StockTransferRequest> findByStatus(TransferStatus status);
}
