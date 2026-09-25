package com.reservehub.enterprise.domain.exception;

/**
 * Thrown when an unauthorized role attempts privilege escalation or access to restricted manifests.
 */
public class UnauthorizedAssetAccessException extends RuntimeException {
    public UnauthorizedAssetAccessException(String message) {
        super(message);
    }
}
