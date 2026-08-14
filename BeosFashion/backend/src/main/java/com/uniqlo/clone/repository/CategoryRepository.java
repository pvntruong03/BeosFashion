package com.uniqlo.clone.repository;

import com.uniqlo.clone.entity.Category;
import com.uniqlo.clone.entity.Gender;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByParentIsNullAndActiveTrueOrderByDisplayOrderAsc();
    List<Category> findByGenderAndParentIsNullAndActiveTrueOrderByDisplayOrderAsc(Gender gender);
    List<Category> findByGenderAndActiveTrue(Gender gender);
    List<Category> findByActiveTrue();
}
