package com.beofashion.repository;

import com.beofashion.entity.Lookbook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LookbookRepository extends JpaRepository<Lookbook, Long> {
    List<Lookbook> findByActiveTrueOrderByCreatedAtDesc();
}
