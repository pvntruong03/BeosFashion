package com.uniqlo.clone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisualSearchRequest {
    private String imageUrl;
    private String imageBase64;
    private String visualHint; // e.g. "áo thun đen", "áo khoác chống nắng"
}
