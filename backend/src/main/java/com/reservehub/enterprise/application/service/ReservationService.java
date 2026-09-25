package com.reservehub.enterprise.application.service;

import com.reservehub.enterprise.application.dto.request.CreateReservationRequestDto;
import com.reservehub.enterprise.application.dto.request.UpdateReservationRequestDto;
import com.reservehub.enterprise.application.dto.response.ReservationResponseDto;
import com.reservehub.enterprise.application.mapper.ReservationMapper;
import com.reservehub.enterprise.application.port.in.ReservationUseCase;
import com.reservehub.enterprise.domain.exception.OverlappingReservationException;
import com.reservehub.enterprise.domain.exception.ResourceNotFoundException;
import com.reservehub.enterprise.domain.model.Asset;
import com.reservehub.enterprise.domain.model.Depot;
import com.reservehub.enterprise.domain.model.Reservation;
import com.reservehub.enterprise.domain.port.out.AssetRepositoryPort;
import com.reservehub.enterprise.domain.port.out.DepotRepositoryPort;
import com.reservehub.enterprise.domain.port.out.ReservationRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Core Application Service orchestrating reservation business rules, collision detection, and dispatching.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService implements ReservationUseCase {

    private final ReservationRepositoryPort reservationRepositoryPort;
    private final AssetRepositoryPort assetRepositoryPort;
    private final DepotRepositoryPort depotRepositoryPort;
    private final ReservationMapper reservationMapper;

    // Turnaround buffer mandated in Stitch UI settings (35 minutes)
    private static final long BUFFER_MINUTES = 35;

    @Override
    @Transactional
    public ReservationResponseDto createReservation(CreateReservationRequestDto request, String authenticatedUserEmail) {
        log.info("Initiating reservation allocation for assetId: {}, requested by: {}", request.getAssetId(), authenticatedUserEmail);

        if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().isEqual(request.getStartTime())) {
            throw new IllegalArgumentException("Reservation end time must be strictly after start time.");
        }

        // 1. Verify target asset exists
        Asset asset = assetRepositoryPort.findById(request.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + request.getAssetId()));

        // 2. Verify depot exists
        Depot depot = depotRepositoryPort.findById(request.getDepotId())
                .orElseThrow(() -> new ResourceNotFoundException("Depot not found with ID: " + request.getDepotId()));

        // 3. Check for overlapping reservations on the same asset (including 35-min sanitation buffer)
        LocalDateTime bufferedStart = request.getStartTime().minusMinutes(BUFFER_MINUTES);
        LocalDateTime bufferedEnd = request.getEndTime().plusMinutes(BUFFER_MINUTES);

        List<Reservation> overlaps = reservationRepositoryPort.findOverlappingReservations(
                request.getAssetId(),
                bufferedStart,
                bufferedEnd
        );

        if (!overlaps.isEmpty()) {
            Reservation conflict = overlaps.get(0);
            String errorMsg = String.format(
                    "Collision detected! Asset [%s - %s] is already allocated from %s to %s (Conflict: %s). Includes %d min sanitation buffer.",
                    asset.getAssetIdentifier(),
                    asset.getName(),
                    conflict.getStartTime(),
                    conflict.getEndTime(),
                    conflict.getReservationCode(),
                    BUFFER_MINUTES
            );
            log.warn("Overlapping reservation attempt rejected: {}", errorMsg);
            throw new OverlappingReservationException(errorMsg);
        }

        // 4. Calculate cost based on asset hourly rate and duration
        long hours = Math.max(1, java.time.Duration.between(request.getStartTime(), request.getEndTime()).toHours());
        BigDecimal baseCost = asset.getBaseHourlyRate().multiply(BigDecimal.valueOf(hours));

        // 5. Build domain aggregate and link descriptors
        Reservation reservation = reservationMapper.toDomain(request, authenticatedUserEmail, baseCost);
        reservation.setAssetIdentifier(asset.getAssetIdentifier());
        reservation.setAssetName(asset.getName());
        reservation.setDepotCode(depot.getCode());

        Reservation saved = reservationRepositoryPort.save(reservation);
        log.info("Reservation successfully created with code: {}", saved.getReservationCode());
        return reservationMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponseDto getReservationById(Long id) {
        Reservation reservation = reservationRepositoryPort.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + id));
        return reservationMapper.toDto(reservation);
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponseDto getReservationByCode(String code) {
        Reservation reservation = reservationRepositoryPort.findByReservationCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with code: " + code));
        return reservationMapper.toDto(reservation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDto> getAllReservations() {
        return reservationRepositoryPort.findAll().stream()
                .map(reservationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDto> getReservationsByAsset(Long assetId) {
        return reservationRepositoryPort.findByAssetId(assetId).stream()
                .map(reservationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReservationResponseDto updateReservation(Long id, UpdateReservationRequestDto request) {
        Reservation reservation = reservationRepositoryPort.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + id));

        if (request.getStartTime() != null && request.getEndTime() != null) {
            // Check overlaps excluding self
            List<Reservation> overlaps = reservationRepositoryPort.findOverlappingReservations(
                    reservation.getAssetId(),
                    request.getStartTime().minusMinutes(BUFFER_MINUTES),
                    request.getEndTime().plusMinutes(BUFFER_MINUTES)
            );
            boolean hasOtherConflict = overlaps.stream().anyMatch(r -> !r.getId().equals(id));
            if (hasOtherConflict) {
                throw new OverlappingReservationException("Updated timeframe conflicts with an existing allocation on this asset.");
            }
            reservation.setStartTime(request.getStartTime());
            reservation.setEndTime(request.getEndTime());
        }

        if (request.getStatus() != null) {
            reservation.setStatus(request.getStatus());
        }
        if (request.getDestinationOrRoom() != null) {
            reservation.setDestinationOrRoom(request.getDestinationOrRoom());
        }
        if (request.getManifestNotes() != null) {
            reservation.setManifestNotes(request.getManifestNotes());
        }
        if (request.getAssignedConcierge() != null) {
            reservation.setAssignedConcierge(request.getAssignedConcierge());
        }

        reservation.setUpdatedAt(LocalDateTime.now());
        Reservation updated = reservationRepositoryPort.save(reservation);
        return reservationMapper.toDto(updated);
    }

    @Override
    @Transactional
    public ReservationResponseDto dispatchReservation(Long id) {
        Reservation reservation = reservationRepositoryPort.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + id));
        reservation.dispatch();
        Reservation saved = reservationRepositoryPort.save(reservation);
        log.info("Reservation {} dispatched to field active transit.", saved.getReservationCode());
        return reservationMapper.toDto(saved);
    }

    @Override
    @Transactional
    public ReservationResponseDto completeReservation(Long id) {
        Reservation reservation = reservationRepositoryPort.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + id));
        reservation.complete();
        Reservation saved = reservationRepositoryPort.save(reservation);
        log.info("Reservation {} marked as COMPLETED.", saved.getReservationCode());
        return reservationMapper.toDto(saved);
    }

    @Override
    @Transactional
    public ReservationResponseDto cancelReservation(Long id) {
        Reservation reservation = reservationRepositoryPort.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + id));
        reservation.cancel();
        Reservation saved = reservationRepositoryPort.save(reservation);
        log.info("Reservation {} marked as CANCELLED.", saved.getReservationCode());
        return reservationMapper.toDto(saved);
    }

    @Override
    @Transactional
    public void deleteReservation(Long id) {
        if (!reservationRepositoryPort.findById(id).isPresent()) {
            throw new ResourceNotFoundException("Cannot delete: reservation not found with ID: " + id);
        }
        reservationRepositoryPort.deleteById(id);
        log.info("Reservation with ID {} permanently removed.", id);
    }
}
