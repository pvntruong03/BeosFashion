package com.beofashion.service;

import com.beofashion.entity.Order;
import com.beofashion.entity.OrderStatus;
import com.beofashion.entity.OrderType;
import com.beofashion.repository.OrderRepository;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RevenueReportServiceTest {

    private final OrderRepository repository = mock(OrderRepository.class);
    private final RevenueReportService service = new RevenueReportService(repository);

    @Test
    void exportsRealExcelWorkbookAndExcludesCancelledOrders() throws Exception {
        when(repository.findAll()).thenReturn(List.of(
                order("BEO-001", OrderStatus.COMPLETED, "1200000", LocalDateTime.of(2026, 9, 16, 10, 30)),
                order("BEO-002", OrderStatus.CANCELLED, "900000", LocalDateTime.of(2026, 9, 16, 11, 30))
        ));

        byte[] bytes = service.exportExcel(LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 30));

        assertThat(bytes).startsWith(0x50, 0x4b);
        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            assertThat(workbook.getSheet("Summary")).isNotNull();
            assertThat(workbook.getSheet("Orders").getLastRowNum()).isEqualTo(1);
            assertThat(workbook.getSheet("Orders").getRow(1).getCell(0).getStringCellValue()).isEqualTo("BEO-001");
        }
    }

    @Test
    void exportsReadablePdfDocument() throws Exception {
        when(repository.findAll()).thenReturn(List.of(
                order("BEO-003", OrderStatus.COMPLETED, "650000", LocalDateTime.of(2026, 9, 17, 9, 0))
        ));

        byte[] bytes = service.exportPdf(LocalDate.of(2026, 9, 17), LocalDate.of(2026, 9, 17));

        assertThat(new String(bytes, 0, 4)).isEqualTo("%PDF");
        assertThat(bytes.length).isGreaterThan(500);
    }

    private Order order(String number, OrderStatus status, String amount, LocalDateTime createdAt) {
        return Order.builder()
                .orderNumber(number)
                .orderType(OrderType.ONLINE_DELIVERY)
                .status(status)
                .customerName("Test Customer")
                .customerPhone("0900000000")
                .subTotal(new BigDecimal(amount))
                .finalAmount(new BigDecimal(amount))
                .createdAt(createdAt)
                .build();
    }
}
