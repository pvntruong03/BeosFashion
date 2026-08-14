package com.uniqlo.clone.repository;

import com.uniqlo.clone.entity.ReturnExchangeRequest;
import com.uniqlo.clone.entity.ReturnStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReturnExchangeRepository extends JpaRepository<ReturnExchangeRequest, Long> {
    List<ReturnExchangeRequest> findByStoreIdOrderByCreatedAtDesc(Long storeId);
    List<ReturnExchangeRequest> findByStatus(ReturnStatus status);
}
