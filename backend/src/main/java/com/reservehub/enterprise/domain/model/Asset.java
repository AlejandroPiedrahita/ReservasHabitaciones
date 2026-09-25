package com.reservehub.enterprise.domain.model;

import com.reservehub.enterprise.domain.model.enums.AssetType;
import com.reservehub.enterprise.domain.model.enums.RoomCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Enterprise asset domain entity (Hospitality Suite).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Asset {
    private Long id;
    private String assetIdentifier; // e.g. ROOM-ORD-95
    private String name;
    private AssetType type;
    private RoomCategory category;
    private Long depotId;
    private String depotCode; // e.g. ORD-01
    private BigDecimal baseHourlyRate;
    private BigDecimal pricePerNight;
    private String status; // ACTIVE, MAINTENANCE, IN_SERVICE
    private String iotLockId;
    private Double cleanlinessScore;
    private String conditionReport;
    private Integer capacityPersons;
    private Integer floor;
    private String notes;
    private List<String> amenities;
    private LocalDateTime lastSanitizedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
