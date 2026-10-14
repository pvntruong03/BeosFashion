package com.beofashion.service;

import com.beofashion.entity.Order;
import com.beofashion.entity.VietQrBankConfig;
import com.beofashion.repository.VietQrBankConfigRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class VietQrService {

    private static final String DEFAULT_BANK_ID = "bidv";
    private static final String DEFAULT_BANK_NAME = "BIDV (Ngân hàng TMCP Đầu tư và Phát triển Việt Nam)";
    private static final String DEFAULT_ACCOUNT_NO = "8900556127";
    private static final String DEFAULT_ACCOUNT_NAME = "PHAM VO NHUT TRUONG";
    private static final String DEFAULT_TEMPLATE = "compact2";

    private final VietQrBankConfigRepository configRepository;

    @Transactional(readOnly = true)
    public BankConfig getBankConfig() {
        VietQrBankConfig config = configRepository.findById(VietQrBankConfig.CONFIG_ID)
                .orElseGet(this::defaultConfig);
        return BankConfig.builder()
                .bankId(config.getBankId())
                .bankName(config.getBankName())
                .accountNo(config.getAccountNo())
                .accountName(config.getAccountName())
                .template(config.getTemplate())
                .build();
    }

    @Transactional
    public void updateBankConfig(BankConfig request) {
        VietQrBankConfig config = configRepository.findById(VietQrBankConfig.CONFIG_ID)
                .orElseGet(this::defaultConfig);
        if (hasText(request.getBankId())) config.setBankId(request.getBankId().trim().toLowerCase());
        if (hasText(request.getBankName())) config.setBankName(request.getBankName().trim());
        if (hasText(request.getAccountNo())) config.setAccountNo(request.getAccountNo().trim());
        if (hasText(request.getAccountName())) config.setAccountName(request.getAccountName().trim().toUpperCase());
        if (hasText(request.getTemplate())) config.setTemplate(request.getTemplate().trim());
        configRepository.save(config);
    }

    @Transactional(readOnly = true)
    public VietQrDetails generateQrDetails(Order order) {
        BankConfig config = getBankConfig();
        String addInfo = "Thanh toan don hang " + order.getOrderNumber();
        long amount = order.getFinalAmount() != null ? order.getFinalAmount().longValue() : 0L;

        String qrUrl = String.format(
                "https://img.vietqr.io/image/%s-%s-%s.png?amount=%d&addInfo=%s&accountName=%s",
                config.getBankId(),
                config.getAccountNo(),
                config.getTemplate(),
                amount,
                URLEncoder.encode(addInfo, StandardCharsets.UTF_8),
                URLEncoder.encode(config.getAccountName(), StandardCharsets.UTF_8)
        );

        return VietQrDetails.builder()
                .bankId(config.getBankId())
                .bankName(config.getBankName())
                .accountNo(config.getAccountNo())
                .accountName(config.getAccountName())
                .amount(BigDecimal.valueOf(amount))
                .transferContent(addInfo)
                .qrImageUrl(qrUrl)
                .orderNumber(order.getOrderNumber())
                .build();
    }

    private VietQrBankConfig defaultConfig() {
        return VietQrBankConfig.builder()
                .id(VietQrBankConfig.CONFIG_ID)
                .bankId(DEFAULT_BANK_ID)
                .bankName(DEFAULT_BANK_NAME)
                .accountNo(DEFAULT_ACCOUNT_NO)
                .accountName(DEFAULT_ACCOUNT_NAME)
                .template(DEFAULT_TEMPLATE)
                .build();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
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
