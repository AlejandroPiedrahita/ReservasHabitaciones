package com.reservehub.enterprise.domain.exception;

/**
 * Thrown when an asset, depot, or reservation is not found in the persistence store.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
