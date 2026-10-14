package com.beofashion.service;

import com.beofashion.entity.Order;
import com.beofashion.entity.OrderStatus;
import com.beofashion.entity.PaymentStatus;
import com.beofashion.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
public class RevenueReportService {

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public byte[] exportExcel(LocalDate from, LocalDate to) throws IOException {
        List<Order> orders = loadOrders(from, to);
        Map<LocalDate, DailyRevenue> daily = aggregateDaily(orders);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_RED.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle currencyStyle = workbook.createCellStyle();
            currencyStyle.setDataFormat(workbook.createDataFormat().getFormat("#,##0\" VND\""));

            Sheet summary = workbook.createSheet("Summary");
            createRow(summary, 0, "BEO FASHION REVENUE REPORT", null, headerStyle);
            createRow(summary, 2, "Period", formatPeriod(from, to), null);
            createRow(summary, 3, "Orders", (double) orders.size(), null);
            BigDecimal totalRevenue = orders.stream().map(Order::getFinalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            Row revenueRow = createRow(summary, 4, "Revenue", totalRevenue.doubleValue(), null);
            revenueRow.getCell(1).setCellStyle(currencyStyle);
            BigDecimal average = orders.isEmpty() ? BigDecimal.ZERO : totalRevenue.divide(BigDecimal.valueOf(orders.size()), 0, java.math.RoundingMode.HALF_UP);
            Row averageRow = createRow(summary, 5, "Average order value", average.doubleValue(), null);
            averageRow.getCell(1).setCellStyle(currencyStyle);
            summary.setColumnWidth(0, 28 * 256);
            summary.setColumnWidth(1, 28 * 256);

            Sheet dailySheet = workbook.createSheet("Daily Revenue");
            Row dailyHeader = dailySheet.createRow(0);
            writeCells(dailyHeader, List.of("Date", "Orders", "Revenue (VND)"), headerStyle);
            int dailyRowIndex = 1;
            for (Map.Entry<LocalDate, DailyRevenue> entry : daily.entrySet()) {
                Row row = dailySheet.createRow(dailyRowIndex++);
                row.createCell(0).setCellValue(entry.getKey().format(DateTimeFormatter.ISO_LOCAL_DATE));
                row.createCell(1).setCellValue(entry.getValue().orders());
                row.createCell(2).setCellValue(entry.getValue().revenue().doubleValue());
                row.getCell(2).setCellStyle(currencyStyle);
            }
            autosize(dailySheet, 3);

            Sheet ordersSheet = workbook.createSheet("Orders");
            Row ordersHeader = ordersSheet.createRow(0);
            writeCells(ordersHeader, List.of("Order number", "Created at", "Customer", "Type", "Status", "Payment", "Store", "Amount (VND)"), headerStyle);
            int orderRowIndex = 1;
            for (Order order : orders) {
                Row row = ordersSheet.createRow(orderRowIndex++);
                row.createCell(0).setCellValue(order.getOrderNumber());
                row.createCell(1).setCellValue(revenueDate(order).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
                row.createCell(2).setCellValue(order.getCustomerName());
                row.createCell(3).setCellValue(order.getOrderType().name());
                row.createCell(4).setCellValue(order.getStatus().name());
                row.createCell(5).setCellValue(order.getPayment() != null ? order.getPayment().getPaymentMethod().name() : "N/A");
                row.createCell(6).setCellValue(order.getStore() != null ? order.getStore().getName() : "Online");
                row.createCell(7).setCellValue(order.getFinalAmount().doubleValue());
                row.getCell(7).setCellStyle(currencyStyle);
            }
            autosize(ordersSheet, 8);

            workbook.write(output);
            return output.toByteArray();
        }
    }

    @Transactional(readOnly = true)
    public byte[] exportPdf(LocalDate from, LocalDate to) throws IOException {
        List<Order> orders = loadOrders(from, to);
        Map<LocalDate, DailyRevenue> daily = aggregateDaily(orders);
        BigDecimal totalRevenue = orders.stream().map(Order::getFinalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        try (PDDocument document = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDType1Font regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDType1Font bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            PDPageContentStream stream = new PDPageContentStream(document, page);
            float y = 800;

            y = writeLine(stream, bold, 18, 44, y, "BEO FASHION - REVENUE REPORT");
            y = writeLine(stream, regular, 10, 44, y - 4, "Period: " + formatPeriod(from, to));
            y = writeLine(stream, bold, 12, 44, y - 8, "Total revenue: " + formatMoney(totalRevenue));
            y = writeLine(stream, regular, 11, 44, y, "Valid orders: " + orders.size());
            BigDecimal average = orders.isEmpty() ? BigDecimal.ZERO : totalRevenue.divide(BigDecimal.valueOf(orders.size()), 0, java.math.RoundingMode.HALF_UP);
            y = writeLine(stream, regular, 11, 44, y, "Average order value: " + formatMoney(average));
            y = writeLine(stream, bold, 12, 44, y - 14, "DAILY PERFORMANCE");
            y = writeLine(stream, bold, 9, 44, y, "Date             Orders             Revenue");

            for (Map.Entry<LocalDate, DailyRevenue> entry : daily.entrySet()) {
                if (y < 70) {
                    stream.close();
                    page = new PDPage(PDRectangle.A4);
                    document.addPage(page);
                    stream = new PDPageContentStream(document, page);
                    y = 800;
                }
                String line = String.format("%-16s %-18d %s", entry.getKey(), entry.getValue().orders(), formatMoney(entry.getValue().revenue()));
                y = writeLine(stream, regular, 9, 44, y, line);
            }

            stream.close();
            document.save(output);
            return output.toByteArray();
        }
    }

    private List<Order> loadOrders(LocalDate from, LocalDate to) {
        LocalDateTime start = (from != null ? from : LocalDate.of(2000, 1, 1)).atStartOfDay();
        LocalDateTime end = (to != null ? to.plusDays(1) : LocalDate.of(2100, 1, 1)).atStartOfDay();
        return orderRepository.findAll().stream()
                .filter(this::isRecognizedRevenue)
                .filter(order -> revenueDate(order) != null)
                .filter(order -> !revenueDate(order).isBefore(start) && revenueDate(order).isBefore(end))
                .sorted(Comparator.comparing(this::revenueDate))
                .toList();
    }

    private boolean isRecognizedRevenue(Order order) {
        return order.getStatus() != OrderStatus.CANCELLED && order.getStatus() != OrderStatus.RETURNED
                && (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.COMPLETED
                || (order.getPayment() != null && order.getPayment().getPaymentStatus() == PaymentStatus.SUCCESS));
    }

    private LocalDateTime revenueDate(Order order) {
        return order.getPayment() != null && order.getPayment().getPaymentTime() != null
                ? order.getPayment().getPaymentTime()
                : order.getCreatedAt();
    }

    private Map<LocalDate, DailyRevenue> aggregateDaily(List<Order> orders) {
        Map<LocalDate, List<Order>> grouped = new TreeMap<>();
        for (Order order : orders) {
            grouped.computeIfAbsent(revenueDate(order).toLocalDate(), ignored -> new ArrayList<>()).add(order);
        }
        Map<LocalDate, DailyRevenue> daily = new TreeMap<>();
        grouped.forEach((date, dayOrders) -> daily.put(date, new DailyRevenue(
                dayOrders.size(),
                dayOrders.stream().map(Order::getFinalAmount).reduce(BigDecimal.ZERO, BigDecimal::add)
        )));
        return daily;
    }

    private Row createRow(Sheet sheet, int index, String label, Object value, CellStyle style) {
        Row row = sheet.createRow(index);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        if (style != null) labelCell.setCellStyle(style);
        if (value != null) {
            Cell valueCell = row.createCell(1);
            if (value instanceof Number number) valueCell.setCellValue(number.doubleValue());
            else valueCell.setCellValue(String.valueOf(value));
        }
        return row;
    }

    private void writeCells(Row row, List<String> values, CellStyle style) {
        for (int i = 0; i < values.size(); i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(values.get(i));
            cell.setCellStyle(style);
        }
    }

    private void autosize(Sheet sheet, int columns) {
        for (int i = 0; i < columns; i++) {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, Math.min(sheet.getColumnWidth(i) + 700, 45 * 256));
        }
    }

    private float writeLine(PDPageContentStream stream, PDType1Font font, float size, float x, float y, String text) throws IOException {
        stream.beginText();
        stream.setFont(font, size);
        stream.newLineAtOffset(x, y);
        stream.showText(text.replaceAll("[^\\x20-\\x7E]", ""));
        stream.endText();
        return y - size - 7;
    }

    private String formatPeriod(LocalDate from, LocalDate to) {
        return (from != null ? from.toString() : "All time") + " to " + (to != null ? to : "Today");
    }

    private String formatMoney(BigDecimal amount) {
        return String.format("%,.0f VND", amount);
    }

    private record DailyRevenue(long orders, BigDecimal revenue) {}
}
