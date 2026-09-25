package com.reservehub.enterprise.infrastructure.persistence.entity;

import com.reservehub.enterprise.domain.model.enums.AssetType;
import com.reservehub.enterprise.domain.model.enums.RoomCategory;
import com.reservehub.enterprise.infrastructure.persistence.converter.StringListConverter;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "assets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_identifier", nullable = false, unique = true, length = 64)
    private String assetIdentifier;

    @Column(nullable = false, length = 128)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AssetType type;

    /** Room category: EXECUTIVE_SUITE, CREW_REST_CABIN, STANDARD_ROOM, LONG_HAUL_VIP */
    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    private RoomCategory category;

    @Column(name = "depot_id", nullable = false)
    private Long depotId;

    @Column(name = "depot_code", length = 32)
    private String depotCode;

    @Column(name = "base_hourly_rate", precision = 10, scale = 2)
    private BigDecimal baseHourlyRate;

    @Column(name = "price_per_night", precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    @Column(length = 32)
    private String status;

    @Column(name = "iot_lock_id", length = 64)
    private String iotLockId;

    @Column(name = "cleanliness_score")
    private Double cleanlinessScore;

    @Column(name = "condition_report", length = 255)
    private String conditionReport;

    /** Number of persons this room can accommodate */
    @Column(name = "capacity_persons")
    private Integer capacityPersons;

    /** Physical floor number */
    @Column(name = "floor")
    private Integer floor;

    /** Room notes / descriptions */
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    /** Amenities stored as JSON array in a TEXT column */
    @Convert(converter = StringListConverter.class)
    @Column(name = "amenities", columnDefinition = "TEXT")
    private List<String> amenities;

    @Column(name = "last_sanitized_at")
    private LocalDateTime lastSanitizedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
