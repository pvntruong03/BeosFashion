package com.beofashion.service;

import com.beofashion.entity.Order;
import com.beofashion.entity.OrderItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderPaymentEmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.mail.from:}")
    private String mailFrom;

    public void sendPaidOrderEmail(Order order) {
        String recipient = order.getCustomerEmail();
        if ((recipient == null || recipient.isBlank()) && order.getUser() != null) {
            recipient = order.getUser().getEmail();
        }
        if (recipient == null || recipient.isBlank()) {
            log.warn("Paid order {} has no customer email", order.getOrderNumber());
            return;
        }
        if (mailUsername == null || mailUsername.isBlank() || mailPassword == null || mailPassword.isBlank()) {
            log.warn("Paid order {} email skipped because SMTP is not configured", order.getOrderNumber());
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(recipient);
            message.setFrom(mailFrom == null || mailFrom.isBlank() ? mailUsername : mailFrom);
            message.setSubject("[BEO] Xác nhận thanh toán đơn " + order.getOrderNumber());
            message.setText(buildInvoiceText(order));
            mailSender.send(message);
        } catch (RuntimeException exception) {
            log.error("Could not send paid-order email for {}", order.getOrderNumber(), exception);
        }
    }

    private String buildInvoiceText(Order order) {
        StringBuilder items = new StringBuilder();
        for (OrderItem item : order.getItems()) {
            items.append("- ").append(item.getProductName())
                    .append(" | ").append(item.getColor())
                    .append(" | Size ").append(item.getSize())
                    .append(" | x").append(item.getQuantity()).append('\n');
        }

        return "BEO Modern Fashion\n\n"
                + "Thanh toán của bạn đã được xác nhận.\n"
                + "Mã đơn: " + order.getOrderNumber() + "\n"
                + "Mã giao dịch: " + order.getPayment().getTransactionId() + "\n"
                + "Tổng thanh toán: " + order.getFinalAmount().setScale(0, RoundingMode.HALF_UP).toPlainString() + " VND\n\n"
                + "Sản phẩm:\n" + items
                + "\nĐịa chỉ nhận hàng: " + order.getShippingAddress() + "\n\n"
                + "Cảm ơn bạn đã mua sắm cùng BEO. Hỗ trợ: 1900019199999";
    }
}
