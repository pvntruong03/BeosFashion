package com.beofashion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisualSearchRequest {
    private String imageUrl;
    private String imageBase64;
    private String modelId;
    private Map<Long, Double> clipScores;
    private List<String> detectedLabels;
}
