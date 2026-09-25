package com.reservehub.enterprise.domain.port.out;

import com.reservehub.enterprise.domain.model.Reservation;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Outbound port for Reservation persistence and interval lookups.
 */
public interface ReservationRepositoryPort {
    Reservation save(Reservation reservation);
    Optional<Reservation> findById(Long id);
    Optional<Reservation> findByReservationCode(String code);
    List<Reservation> findAll();
    List<Reservation> findByAssetId(Long assetId);
    List<Reservation> findOverlappingReservations(Long assetId, LocalDateTime start, LocalDateTime end);
    void deleteById(Long id);
}
