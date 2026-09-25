package com.reservehub.enterprise.infrastructure.web.controller;

import com.reservehub.enterprise.application.dto.request.CreateReservationRequestDto;
import com.reservehub.enterprise.application.dto.request.UpdateReservationRequestDto;
import com.reservehub.enterprise.application.dto.response.ErrorResponseDto;
import com.reservehub.enterprise.application.dto.response.ReservationResponseDto;
import com.reservehub.enterprise.application.port.in.ReservationUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "2. Reservations & Dispatch Logistics", description = "CRUD and lifecycle state transitions for enterprise assets")
@SecurityRequirement(name = "bearerAuth")
public class ReservationController {

    private final ReservationUseCase reservationUseCase;

    @PostMapping
    @Operation(summary = "Allocate Suite Reservation", description = "Reserves a hospitality suite. Validates against overlapping timeframes and applies 35-min sanitation buffer.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Reservation successfully booked and confirmed",
                    content = @Content(schema = @Schema(implementation = ReservationResponseDto.class))),
            @ApiResponse(responseCode = "409", description = "Collision detected! Overlapping reservation already exists on asset",
                    content = @Content(schema = @Schema(implementation = ErrorResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid payload or validation constraint failure",
                    content = @Content(schema = @Schema(implementation = ErrorResponseDto.class))),
            @ApiResponse(responseCode = "401", description = "Authentication token missing or invalid",
                    content = @Content(schema = @Schema(implementation = ErrorResponseDto.class)))
    })
    public ResponseEntity<ReservationResponseDto> createReservation(
            @Valid @RequestBody CreateReservationRequestDto request,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "system-operator";
        ReservationResponseDto response = reservationUseCase.createReservation(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "List Active Dispatches & Bookings", description = "Retrieves all multi-modal asset allocations across North America regional hubs.")
    @ApiResponse(responseCode = "200", description = "List of active reservations",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = ReservationResponseDto.class))))
    public ResponseEntity<List<ReservationResponseDto>> getAllReservations() {
        return ResponseEntity.ok(reservationUseCase.getAllReservations());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Reservation by ID", description = "Fetch a single reservation detail including line-item pricing breakdown.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reservation found"),
            @ApiResponse(responseCode = "404", description = "Reservation not found")
    })
    public ResponseEntity<ReservationResponseDto> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(reservationUseCase.getReservationById(id));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get Reservation by Manifest Code", description = "Look up reservation by tracking manifest code (e.g., RES-2026-8841).")
    public ResponseEntity<ReservationResponseDto> getByCode(@PathVariable("code") String code) {
        return ResponseEntity.ok(reservationUseCase.getReservationByCode(code));
    }

    @GetMapping("/asset/{assetId}")
    @Operation(summary = "Get History by Asset ID", description = "Retrieve all allocations assigned to a specific hospitality suite.")
    public ResponseEntity<List<ReservationResponseDto>> getByAsset(@PathVariable("assetId") Long assetId) {
        return ResponseEntity.ok(reservationUseCase.getReservationsByAsset(assetId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Reservation Details", description = "Modify destination, assigned driver, or timeframe.")
    public ResponseEntity<ReservationResponseDto> update(
            @PathVariable("id") Long id,
            @RequestBody UpdateReservationRequestDto request) {
        return ResponseEntity.ok(reservationUseCase.updateReservation(id, request));
    }

    @PostMapping("/{id}/dispatch")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign Suite for Arrival [ROLE_ADMIN ONLY]", description = "Fast-action transition from CONFIRMED to IN_TRANSIT.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Asset transitioned to IN_TRANSIT"),
            @ApiResponse(responseCode = "403", description = "Insufficient role privilege (requires ROLE_ADMIN)")
    })
    public ResponseEntity<ReservationResponseDto> dispatch(@PathVariable("id") Long id) {
        return ResponseEntity.ok(reservationUseCase.dispatchReservation(id));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete Mission & Release Asset", description = "Transitions reservation to COMPLETED state and unlocks inventory.")
    public ResponseEntity<ReservationResponseDto> complete(@PathVariable("id") Long id) {
        return ResponseEntity.ok(reservationUseCase.completeReservation(id));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel Reservation", description = "Cancels active reservation and releases schedule lock.")
    public ResponseEntity<ReservationResponseDto> cancel(@PathVariable("id") Long id) {
        return ResponseEntity.ok(reservationUseCase.cancelReservation(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Purge Reservation Manifest [ROLE_ADMIN ONLY]", description = "Permanently deletes a reservation record from the system.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Reservation permanently removed"),
            @ApiResponse(responseCode = "403", description = "Access denied: Requires ROLE_ADMIN privilege")
    })
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        reservationUseCase.deleteReservation(id);
        return ResponseEntity.noContent().build();
    }
}
