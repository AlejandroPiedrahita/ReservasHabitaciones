package com.reservehub.enterprise.domain.exception;

/**
 * Thrown when an asset reservation request collides with an existing active allocation window.
 */
public class OverlappingReservationException extends RuntimeException {
    public OverlappingReservationException(String message) {
        super(message);
    }
}
