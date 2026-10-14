package com.beofashion.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "vietqr_bank_config")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VietQrBankConfig {

    public static final String CONFIG_ID = "BENEFICIARY";

    @Id
    @Column(name = "config_id", nullable = false, length = 40)
    private String id;

    @Column(nullable = false, length = 40)
    private String bankId;

    @Column(nullable = false, length = 160)
    private String bankName;

    @Column(nullable = false, length = 40)
    private String accountNo;

    @Column(nullable = false, length = 160)
    private String accountName;

    @Column(nullable = false, length = 40)
    private String template;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
