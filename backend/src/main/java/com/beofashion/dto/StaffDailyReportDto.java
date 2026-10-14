package com.beofashion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffDailyReportDto {
    private Long storeId;
    private String storeName;
    private String reportDate;
    private BigDecimal todayRevenue;
    private Long totalOrdersToday;
    private Long posOrdersCount;
    private Long onlineFulfillmentCount;
    private Long pendingPickupOrders;
    private Long lowStockVariantsCount;
    private List<OrderDto> recentStoreOrders;
}
