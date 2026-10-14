package com.beofashion.service;

import com.beofashion.entity.VietQrBankConfig;
import com.beofashion.repository.VietQrBankConfigRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class VietQrServiceTest {

    private final VietQrBankConfigRepository repository = mock(VietQrBankConfigRepository.class);
    private final VietQrService service = new VietQrService(repository);

    @Test
    void savesBankConfigurationAndReadsItBackAfterRestart() {
        when(repository.findById(VietQrBankConfig.CONFIG_ID)).thenReturn(Optional.empty());

        service.updateBankConfig(VietQrService.BankConfig.builder()
                .bankId("MBbank")
                .bankName("MB Bank")
                .accountNo("190019199999")
                .accountName("Beo Fashion Vietnam")
                .template("compact2")
                .build());

        ArgumentCaptor<VietQrBankConfig> saved = ArgumentCaptor.forClass(VietQrBankConfig.class);
        verify(repository).save(saved.capture());
        VietQrBankConfig savedConfig = saved.getValue();

        when(repository.findById(VietQrBankConfig.CONFIG_ID)).thenReturn(Optional.of(savedConfig));
        VietQrService restartedService = new VietQrService(repository);
        VietQrService.BankConfig config = restartedService.getBankConfig();

        assertThat(config.getBankId()).isEqualTo("mbbank");
        assertThat(config.getBankName()).isEqualTo("MB Bank");
        assertThat(config.getAccountNo()).isEqualTo("190019199999");
        assertThat(config.getAccountName()).isEqualTo("BEO FASHION VIETNAM");
    }
}
