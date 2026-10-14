package com.beofashion.controller;

import com.beofashion.entity.Order;
import com.beofashion.entity.OrderStatus;
import com.beofashion.entity.Payment;
import com.beofashion.entity.PaymentMethod;
import com.beofashion.entity.PaymentStatus;
import com.beofashion.repository.OrderRepository;
import com.beofashion.repository.PaymentRepository;
import com.beofashion.service.OrderPaymentEmailService;
import com.beofashion.service.VietQrService;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PaymentControllerTest {

    @Test
    void acceptsOnlyMatchingAuthenticatedIncomingTransfer() {
        OrderRepository orders = mock(OrderRepository.class);
        PaymentRepository payments = mock(PaymentRepository.class);
        OrderPaymentEmailService email = mock(OrderPaymentEmailService.class);
        PaymentController controller = new PaymentController(orders, payments, mock(VietQrService.class), email);
        ReflectionTestUtils.setField(controller, "sePayWebhookApiKey", "test-secret");

        Payment payment = new Payment();
        payment.setPaymentMethod(PaymentMethod.VIETQR);
        payment.setPaymentStatus(PaymentStatus.PENDING);
        Order order = new Order();
        order.setOrderNumber("BEO-261014-ABCDE");
        order.setFinalAmount(new BigDecimal("349000"));
        order.setStatus(OrderStatus.PENDING);
        order.setPayment(payment);
        when(payments.findByTransactionId("SEPAY-92704")).thenReturn(Optional.empty());
        when(orders.findByOrderNumber(order.getOrderNumber())).thenReturn(Optional.of(order));
        when(orders.save(order)).thenReturn(order);

        PaymentController.SePayWebhookRequest request = new PaymentController.SePayWebhookRequest(
                92704L, "", "Thanh toan BEO-261014-ABCDE", "in", new BigDecimal("349000"), "MB-1");
        controller.handleSePayWebhook("Apikey test-secret", request);

        assertEquals(PaymentStatus.SUCCESS, payment.getPaymentStatus());
        assertEquals(OrderStatus.CONFIRMED, order.getStatus());
        assertEquals("SEPAY-92704", payment.getTransactionId());
        verify(payments).save(payment);
        verify(email).sendPaidOrderEmail(order);
    }

    @Test
    void rejectsWebhookWithWrongApiKey() {
        PaymentController controller = new PaymentController(mock(OrderRepository.class), mock(PaymentRepository.class),
                mock(VietQrService.class), mock(OrderPaymentEmailService.class));
        ReflectionTestUtils.setField(controller, "sePayWebhookApiKey", "test-secret");

        assertThrows(AccessDeniedException.class, () -> controller.handleSePayWebhook("Apikey incorrect",
                new PaymentController.SePayWebhookRequest()));
    }
}
