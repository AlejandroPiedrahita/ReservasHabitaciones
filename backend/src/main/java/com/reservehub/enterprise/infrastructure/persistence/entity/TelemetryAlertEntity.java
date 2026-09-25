package com.reservehub.enterprise.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Persists IoT and system telemetry alerts generated from real-time
 * monitoring of hospitality suite sensors, IoT locks, and network events.
 */
@Entity
@Table(name = "telemetry_alerts", indexes = {
        @Index(name = "idx_alert_severity", columnList = "severity"),
        @Index(name = "idx_alert_resolved", columnList = "resolved"),
        @Index(name = "idx_alert_timestamp", columnList = "timestamp")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelemetryAlertEntity {

    @Id
    @Column(name = "id", nullable = false, length = 64)
    private String id; // e.g. "ALERT-2026-001" (assigned by frontend/generator)

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    /** CRITICAL, WARNING, INFO */
    @Column(name = "severity", nullable = false, length = 16)
    private String severity;

    @Column(name = "resolved", nullable = false)
    @Builder.Default
    private boolean resolved = false;

    @Column(name = "resolution_note", columnDefinition = "TEXT")
    private String resolutionNote;

    /** Comma-separated list of quick-action labels */
    @Column(name = "actions", length = 500)
    private String actions;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
