package com.reservehub.enterprise.application.dto.response;

import com.reservehub.enterprise.domain.model.enums.ReservationStatus;
import com.reservehub.enterprise.domain.model.enums.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response representation of an allocated enterprise reservation")
public class ReservationResponseDto {
    private Long id;
    private String reservationCode;
    private Long assetId;
    private String assetIdentifier;
    private String assetName;
    private Long depotId;
    private String depotCode;
    private Long userId;
    private String userEmail;
    private String customerName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ReservationStatus status;
    private BigDecimal baseCost;
    private BigDecimal serviceFee;
    private BigDecimal insuranceFee;
    private BigDecimal totalAmount;
    private String destinationOrRoom;
    private String manifestNotes;
    private String assignedConcierge;
    // ── Payment ──────────────────────────────────────────────────────────────────
    private PaymentStatus paymentStatus;
    private LocalDateTime paidAt;
    private String paymentMethod;
    private String paymentLast4;
    private String paymentTxId;
    // ── Audit ─────────────────────────────────────────────────────────────────────
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
