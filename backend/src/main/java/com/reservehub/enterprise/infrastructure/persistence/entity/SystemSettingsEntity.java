package com.reservehub.enterprise.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Persists global enterprise configuration settings for the ReserveHub platform.
 * Uses a single-row pattern (id=1) — the front-end always reads/writes this record.
 */
@Entity
@Table(name = "system_settings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemSettingsEntity {

    /** Always 1 — single-row configuration table */
    @Id
    @Column(name = "id")
    @Builder.Default
    private Long id = 1L;

    /** Enforces that dirty rooms cannot accept new reservations */
    @Column(name = "strict_housekeeping_lock", nullable = false)
    @Builder.Default
    private boolean strictHousekeepingLock = true;

    /** Mandatory sanitation buffer in minutes between back-to-back reservations */
    @Column(name = "turnaround_buffer_minutes", nullable = false)
    @Builder.Default
    private int turnaroundBufferMinutes = 35;

    /** Enables live sync with the Property Management System */
    @Column(name = "hospitality_pms_sync", nullable = false)
    @Builder.Default
    private boolean hospitalityPmsSync = true;

    /** Maximum minutes allowed for late checkout beyond scheduled end time */
    @Column(name = "max_late_checkout_grace_minutes", nullable = false)
    @Builder.Default
    private int maxLateCheckoutGraceMinutes = 25;

    /** JWT lifetime: 15m, 60m, 8h */
    @Column(name = "jwt_bearer_lifetime", nullable = false, length = 8)
    @Builder.Default
    private String jwtBearerLifetime = "15m";

    /** Mandates hardware FIDO2 security keys for admin logins */
    @Column(name = "mandate_fido2_keys", nullable = false)
    @Builder.Default
    private boolean mandateFido2Keys = true;

    /** SHA-256 hash of the active KMS encryption key */
    @Column(name = "kms_key_hash", length = 128)
    private String kmsKeyHash;

    /** Service fee percentage applied to all reservations */
    @Column(name = "service_fee_rate", precision = 6, scale = 4)
    @Builder.Default
    private BigDecimal serviceFeeRate = new BigDecimal("4.25");

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
