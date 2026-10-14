package com.beofashion.repository;

import com.beofashion.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
    Optional<Store> findByCode(String code);
    List<Store> findByActiveTrue();
    List<Store> findByCityIgnoreCase(String city);
}
