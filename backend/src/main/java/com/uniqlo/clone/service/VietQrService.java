package com.uniqlo.clone.service;

import com.uniqlo.clone.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class VietQrService {

    private String bankId = "vietinbank"; // vietinbank, vcb, mbbank, techcombank, acb, tpbank...
    private String bankName = "VietinBank (Ngân hàng TMCP Công Thương Việt Nam)";
    private String accountNo = "113366668888";
    private String accountName = "BEO FASHION VIETNAM";
    private String template = "compact2"; // compact, compact2, qr_only, print

    public synchronized BankConfig getBankConfig() {
        return BankConfig.builder()
                .bankId(this.bankId)
                .bankName(this.bankName)
                .accountNo(this.accountNo)
                .accountName(this.accountName)
                .template(this.template)
                .build();
    }

    public synchronized void updateBankConfig(BankConfig config) {
        if (config.getBankId() != null && !config.getBankId().isBlank()) this.bankId = config.getBankId();
        if (config.getBankName() != null && !config.getBankName().isBlank()) this.bankName = config.getBankName();
        if (config.getAccountNo() != null && !config.getAccountNo().isBlank()) this.accountNo = config.getAccountNo();
        if (config.getAccountName() != null && !config.getAccountName().isBlank()) this.accountName = config.getAccountName();
        if (config.getTemplate() != null && !config.getTemplate().isBlank()) this.template = config.getTemplate();
    }

    public VietQrDetails generateQrDetails(Order order) {
        String addInfo = "Thanh toan don hang " + order.getOrderNumber();
        long amount = order.getFinalAmount() != null ? order.getFinalAmount().longValue() : 0L;

        String qrUrl = String.format(
                "https://img.vietqr.io/image/%s-%s-%s.png?amount=%d&addInfo=%s&accountName=%s",
                this.bankId,
                this.accountNo,
                this.template,
                amount,
                URLEncoder.encode(addInfo, StandardCharsets.UTF_8),
                URLEncoder.encode(this.accountName, StandardCharsets.UTF_8)
        );

        return VietQrDetails.builder()
                .bankId(this.bankId)
                .bankName(this.bankName)
                .accountNo(this.accountNo)
                .accountName(this.accountName)
                .amount(BigDecimal.valueOf(amount))
                .transferContent(addInfo)
                .qrImageUrl(qrUrl)
                .orderNumber(order.getOrderNumber())
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BankConfig {
        private String bankId;
        private String bankName;
        private String accountNo;
        private String accountName;
        private String template;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VietQrDetails {
        private String bankId;
        private String bankName;
        private String accountNo;
        private String accountName;
        private BigDecimal amount;
        private String transferContent;
        private String qrImageUrl;
        private String orderNumber;
    }
}
