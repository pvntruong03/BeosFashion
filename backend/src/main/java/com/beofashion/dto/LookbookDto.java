package com.beofashion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LookbookDto {
    private Long id;
    private String title;
    private String description;
    private String mainImage;
    private List<LookbookItemDto> items;
}
