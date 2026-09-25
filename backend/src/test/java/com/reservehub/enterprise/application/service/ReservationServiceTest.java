package com.reservehub.enterprise.application.service;

import com.reservehub.enterprise.application.dto.request.CreateReservationRequestDto;
import com.reservehub.enterprise.application.dto.response.ReservationResponseDto;
import com.reservehub.enterprise.application.mapper.ReservationMapper;
import com.reservehub.enterprise.domain.exception.OverlappingReservationException;
import com.reservehub.enterprise.domain.exception.ResourceNotFoundException;
import com.reservehub.enterprise.domain.model.Asset;
import com.reservehub.enterprise.domain.model.Depot;
import com.reservehub.enterprise.domain.model.Reservation;
import com.reservehub.enterprise.domain.model.enums.AssetType;
import com.reservehub.enterprise.domain.model.enums.ReservationStatus;
import com.reservehub.enterprise.domain.port.out.AssetRepositoryPort;
import com.reservehub.enterprise.domain.port.out.DepotRepositoryPort;
import com.reservehub.enterprise.domain.port.out.ReservationRepositoryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * QA Test Suite for ReservationService testing business invariants,
 * lifecycle state machines, and overlapping collision detection.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ReservationService QA Unit Test Suite")
class ReservationServiceTest {

    @Mock
    private ReservationRepositoryPort reservationRepositoryPort;

    @Mock
    private AssetRepositoryPort assetRepositoryPort;

    @Mock
    private DepotRepositoryPort depotRepositoryPort;

    @Spy
    private ReservationMapper reservationMapper = new ReservationMapper();

    @InjectMocks
    private ReservationService reservationService;

    private Asset mockAsset;
    private Depot mockDepot;
    private CreateReservationRequestDto validRequest;

    @BeforeEach
    void setUp() {
        mockAsset = Asset.builder()
                .id(1L)
                .assetIdentifier("ROOM-ORD-14B")
                .name("Highland Reserve Executive Suite 14B")
                .type(AssetType.HOSPITALITY_SUITE)
                .depotId(1L)
                .depotCode("ORD-01")
                .baseHourlyRate(new BigDecimal("150.00"))
                .status("ACTIVE")
                .build();

        mockDepot = Depot.builder()
                .id(1L)
                .code("ORD-01")
                .name("Chicago Central Hospitality Hub")
                .build();

        validRequest = CreateReservationRequestDto.builder()
                .assetId(1L)
                .depotId(1L)
                .customerName("Apex Enterprises Global")
                .startTime(LocalDateTime.now().plusDays(1).withHour(8).withMinute(0))
                .endTime(LocalDateTime.now().plusDays(1).withHour(16).withMinute(0))
                .destinationOrRoom("Suite 14B (Floor 3)")
                .manifestNotes("Executive suite reservation for corporate delegation")
                .assignedConcierge("Central Concierge (Morning Shift)")
                .build();
    }

    @Test
    @DisplayName("Should successfully allocate and confirm a non-colliding reservation")
    void shouldCreateReservationSuccessfully() {
        // GIVEN
        when(assetRepositoryPort.findById(1L)).thenReturn(Optional.of(mockAsset));
        when(depotRepositoryPort.findById(1L)).thenReturn(Optional.of(mockDepot));
        when(reservationRepositoryPort.findOverlappingReservations(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        when(reservationRepositoryPort.save(any(Reservation.class)))
                .thenAnswer(invocation -> {
                    Reservation r = invocation.getArgument(0);
                    r.setId(99L);
                    return r;
                });

        // WHEN
        ReservationResponseDto response = reservationService.createReservation(validRequest, "m.armstrong@enterprise-reservehub.net");

        // THEN
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(99L);
        assertThat(response.getStatus()).isEqualTo(ReservationStatus.CONFIRMED);
        assertThat(response.getAssetIdentifier()).isEqualTo("ROOM-ORD-14B");
        assertThat(response.getCustomerName()).isEqualTo("Apex Enterprises Global");
        assertThat(response.getTotalAmount()).isGreaterThan(BigDecimal.ZERO);

        verify(reservationRepositoryPort, times(1)).save(any(Reservation.class));
    }

    @Test
    @DisplayName("Should throw OverlappingReservationException when collision occurs on asset")
    void shouldThrowOverlappingReservationExceptionWhenAssetIsOccupied() {
        // GIVEN
        Reservation conflictingReservation = Reservation.builder()
                .id(101L)
                .reservationCode("RES-2026-CONFLICT")
                .assetId(1L)
                .startTime(validRequest.getStartTime().plusHours(1))
                .endTime(validRequest.getEndTime().plusHours(2))
                .status(ReservationStatus.CONFIRMED)
                .build();

        when(assetRepositoryPort.findById(1L)).thenReturn(Optional.of(mockAsset));
        when(depotRepositoryPort.findById(1L)).thenReturn(Optional.of(mockDepot));
        when(reservationRepositoryPort.findOverlappingReservations(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(conflictingReservation));

        // WHEN & THEN
        assertThatThrownBy(() -> reservationService.createReservation(validRequest, "operator@enterprise.com"))
                .isInstanceOf(OverlappingReservationException.class)
                .hasMessageContaining("Collision detected!")
                .hasMessageContaining("ROOM-ORD-14B");

        verify(reservationRepositoryPort, never()).save(any(Reservation.class));
    }

    @Test
    @DisplayName("Should reject reservation with start time after end time")
    void shouldRejectInvalidTimeBounds() {
        validRequest.setStartTime(LocalDateTime.now().plusDays(2));
        validRequest.setEndTime(LocalDateTime.now().plusDays(1)); // end before start

        assertThatThrownBy(() -> reservationService.createReservation(validRequest, "operator@enterprise.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("strictly after start time");
    }

    @Test
    @DisplayName("Should dispatch confirmed reservation into IN_TRANSIT status")
    void shouldDispatchReservationSuccessfully() {
        Reservation confirmed = Reservation.builder()
                .id(50L)
                .reservationCode("RES-2026-TEST")
                .status(ReservationStatus.CONFIRMED)
                .updatedAt(LocalDateTime.now())
                .build();

        when(reservationRepositoryPort.findById(50L)).thenReturn(Optional.of(confirmed));
        when(reservationRepositoryPort.save(any(Reservation.class))).thenAnswer(i -> i.getArgument(0));

        ReservationResponseDto result = reservationService.dispatchReservation(50L);

        assertThat(result.getStatus()).isEqualTo(ReservationStatus.IN_TRANSIT);
        verify(reservationRepositoryPort).save(confirmed);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when non-existent ID requested")
    void shouldThrowWhenReservationNotFound() {
        when(reservationRepositoryPort.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reservationService.getReservationById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Reservation not found with ID: 999");
    }
}
