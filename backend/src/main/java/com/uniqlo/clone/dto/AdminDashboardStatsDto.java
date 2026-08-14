package com.uniqlo.clone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsDto {
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private Long totalCustomers;
    private Long totalProducts;
    private Long pendingOrdersCount;
    private Long lowStockItemsCount;

    private List<DailyRevenueDto> revenueLast7Days;
    private List<TopSellingProductDto> topSellingProducts;
    private List<StoreSalesDto> storeSalesComparison;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyRevenueDto {
        private String date;
        private BigDecimal revenue;
        private Long orderCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopSellingProductDto {
        private Long productId;
        private String name;
        private String code;
        private String imageUrl;
        private BigDecimal price;
        private Long totalSold;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StoreSalesDto {
        private Long storeId;
        private String storeName;
        private String storeCode;
        private BigDecimal totalRevenue;
        private Long orderCount;
    }
}
