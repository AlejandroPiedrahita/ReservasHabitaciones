package com.reservehub.enterprise.domain.model;

import com.reservehub.enterprise.domain.model.enums.ReservationStatus;
import com.reservehub.enterprise.domain.model.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Reservation Aggregate Root enforcing domain invariants and lifecycle transitions.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {
    private Long id;
    private String reservationCode; // e.g. RES-2026-8841
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

    // ── Payment ─────────────────────────────────────────────────────────────────
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;
    private LocalDateTime paidAt;
    private String paymentMethod;
    private String paymentLast4;
    private String paymentTxId;

    // ── Audit ───────────────────────────────────────────────────────────────────
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Domain business method: check if candidate time overlaps with this reservation.
     */
    public boolean overlapsWith(LocalDateTime candidateStart, LocalDateTime candidateEnd) {
        // Active reservations only (ignore CANCELLED or COMPLETED)
        if (this.status == ReservationStatus.CANCELLED || this.status == ReservationStatus.COMPLETED) {
            return false;
        }
        // Overlap formula: candidateStart < existingEnd && candidateEnd > existingStart
        return candidateStart.isBefore(this.endTime) && candidateEnd.isAfter(this.startTime);
    }

    /**
     * Domain state machine transition: assign the suite for arrival.
     */
    public void dispatch() {
        if (this.status != ReservationStatus.CONFIRMED && this.status != ReservationStatus.PENDING) {
            throw new IllegalStateException("Cannot dispatch reservation with current status: " + this.status);
        }
        this.status = ReservationStatus.IN_TRANSIT;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Domain state machine transition: complete reservation.
     */
    public void complete() {
        if (this.status != ReservationStatus.IN_TRANSIT && this.status != ReservationStatus.CONFIRMED) {
            throw new IllegalStateException("Cannot complete reservation with current status: " + this.status);
        }
        this.status = ReservationStatus.COMPLETED;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Domain state machine transition: cancel reservation.
     */
    public void cancel() {
        if (this.status == ReservationStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel an already completed reservation.");
        }
        this.status = ReservationStatus.CANCELLED;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Domain business method: record a successful payment for this reservation.
     */
    public void recordPayment(String method, String last4, String txId) {
        this.paymentStatus = PaymentStatus.PAID;
        this.paidAt = LocalDateTime.now();
        this.paymentMethod = method;
        this.paymentLast4 = last4;
        this.paymentTxId = txId;
        this.updatedAt = LocalDateTime.now();
    }
}
