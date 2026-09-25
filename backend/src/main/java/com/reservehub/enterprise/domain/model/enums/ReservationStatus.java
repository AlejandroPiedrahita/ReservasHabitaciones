package com.reservehub.enterprise.domain.model.enums;

/**
 * State machine stages for mission-critical reservations.
 */
public enum ReservationStatus {
    PENDING,
    CONFIRMED,
    IN_TRANSIT,
    COMPLETED,
    CANCELLED
}
