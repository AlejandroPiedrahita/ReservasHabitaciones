package com.reservehub.enterprise.infrastructure.persistence.entity;

import com.reservehub.enterprise.domain.model.enums.ReservationStatus;
import com.reservehub.enterprise.domain.model.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations", indexes = {
        @Index(name = "idx_res_asset_time", columnList = "asset_id, start_time, end_time"),
        @Index(name = "idx_res_status", columnList = "status"),
        @Index(name = "idx_res_code", columnList = "reservation_code", unique = true)
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reservation_code", nullable = false, unique = true, length = 64)
    private String reservationCode;

    @Column(name = "asset_id", nullable = false)
    private Long assetId;

    @Column(name = "asset_identifier", length = 64)
    private String assetIdentifier;

    @Column(name = "asset_name", length = 128)
    private String assetName;

    @Column(name = "depot_id", nullable = false)
    private Long depotId;

    @Column(name = "depot_code", length = 32)
    private String depotCode;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_email", length = 128)
    private String userEmail;

    @Column(name = "customer_name", nullable = false, length = 128)
    private String customerName;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ReservationStatus status;

    @Column(name = "base_cost", precision = 12, scale = 2)
    private BigDecimal baseCost;

    @Column(name = "service_fee", precision = 12, scale = 2)
    private BigDecimal serviceFee;

    @Column(name = "insurance_fee", precision = 12, scale = 2)
    private BigDecimal insuranceFee;

    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "destination_or_room", length = 255)
    private String destinationOrRoom;

    @Column(name = "manifest_notes", length = 1000)
    private String manifestNotes;

    @Column(name = "assigned_concierge", length = 128)
    private String assignedConcierge;

    // ── Payment Fields ──────────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 16)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    /** e.g. VISA, MASTERCARD, AMEX */
    @Column(name = "payment_method", length = 64)
    private String paymentMethod;

    /** Last 4 digits of card */
    @Column(name = "payment_last4", length = 4)
    private String paymentLast4;

    /** External payment gateway transaction ID */
    @Column(name = "payment_tx_id", length = 128)
    private String paymentTxId;

    // ── Audit ───────────────────────────────────────────────────────────────────
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
        if (paymentStatus == null) {
            paymentStatus = PaymentStatus.UNPAID;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
