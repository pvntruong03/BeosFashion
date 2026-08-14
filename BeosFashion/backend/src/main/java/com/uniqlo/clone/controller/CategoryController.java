package com.uniqlo.clone.controller;

import com.uniqlo.clone.dto.ApiResponse;
import com.uniqlo.clone.dto.CategoryDto;
import com.uniqlo.clone.entity.Gender;
import com.uniqlo.clone.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Hierarchical Category browsing")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get all root categories with subcategory trees")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAllRootCategories()));
    }

    @GetMapping("/gender/{gender}")
    @Operation(summary = "Get categories by gender (MEN, WOMEN, KIDS, BABY)")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategoriesByGender(@PathVariable Gender gender) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getCategoriesByGender(gender)));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get category by slug")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getCategoryBySlug(slug)));
    }
}
