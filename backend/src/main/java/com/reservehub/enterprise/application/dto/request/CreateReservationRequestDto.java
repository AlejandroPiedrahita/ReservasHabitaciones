package com.reservehub.enterprise.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Payload to allocate an enterprise asset reservation")
public class CreateReservationRequestDto {

    @NotNull(message = "Asset ID is required")
    @Schema(description = "ID of the target hospitality suite", example = "1")
    private Long assetId;

    @NotNull(message = "Depot ID is required")
    @Schema(description = "ID of the hospitality hub (ORD-01, ATL-04, DFW-02)", example = "1")
    private Long depotId;

    @NotBlank(message = "Customer name or booking entity is required")
    @Schema(description = "Corporate client or account entity name", example = "Apex Global Logistics")
    private String customerName;

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    @Schema(description = "Reservation start timestamp (ISO-8601)", example = "2026-10-01T08:00:00")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Schema(description = "Reservation end timestamp (ISO-8601)", example = "2026-10-03T18:00:00")
    private LocalDateTime endTime;

    @Schema(description = "Target suite tier or room assignment", example = "Suite 14B (Piso 3, ORD-01)")
    private String destinationOrRoom;

    @Schema(description = "Manifest notes or concierge instructions", example = "Executive suite reservation for corporate delegation")
    private String manifestNotes;

    @Schema(description = "Assigned VIP concierge identifier", example = "Central Concierge (Morning Shift)")
    private String assignedConcierge;
}
