package com.uniqlo.clone.dto;

import com.uniqlo.clone.entity.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    private Long id;
    private String name;
    private String slug;
    private Gender gender;
    private Long parentId;
    private String parentName;
    private String icon;
    private String bannerImage;
    private Integer displayOrder;
    private boolean active;
    private List<CategoryDto> children;
}
