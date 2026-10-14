package com.beofashion.service;

import com.beofashion.dto.CategoryDto;
import com.beofashion.entity.Category;
import com.beofashion.entity.Gender;
import com.beofashion.exception.ResourceNotFoundException;
import com.beofashion.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllRootCategories() {
        return categoryRepository.findByParentIsNullAndActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::mapToDtoWithChildren)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getCategoriesByGender(Gender gender) {
        return categoryRepository.findByGenderAndParentIsNullAndActiveTrueOrderByDisplayOrderAsc(gender).stream()
                .map(this::mapToDtoWithChildren)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDto getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
        return mapToDtoWithChildren(category);
    }

    public CategoryDto mapToDtoWithChildren(Category category) {
        List<CategoryDto> childrenDtos = category.getChildren() != null
                ? category.getChildren().stream()
                    .filter(Category::isActive)
                    .map(this::mapToDtoWithChildren)
                    .collect(Collectors.toList())
                : List.of();

        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .gender(category.getGender())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .icon(category.getIcon())
                .bannerImage(category.getBannerImage())
                .displayOrder(category.getDisplayOrder())
                .active(category.isActive())
                .children(childrenDtos)
                .build();
    }
}
