package com.beofashion.repository;

import com.beofashion.entity.VietQrBankConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VietQrBankConfigRepository extends JpaRepository<VietQrBankConfig, String> {
}
