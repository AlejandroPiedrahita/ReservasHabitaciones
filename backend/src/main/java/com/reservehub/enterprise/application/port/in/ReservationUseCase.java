package com.reservehub.enterprise.application.port.in;

import com.reservehub.enterprise.application.dto.request.CreateReservationRequestDto;
import com.reservehub.enterprise.application.dto.request.UpdateReservationRequestDto;
import com.reservehub.enterprise.application.dto.response.ReservationResponseDto;

import java.util.List;

/**
 * Inbound port for managing enterprise reservation lifecycles and dispatch operations.
 */
public interface ReservationUseCase {
    ReservationResponseDto createReservation(CreateReservationRequestDto request, String authenticatedUserEmail);
    ReservationResponseDto getReservationById(Long id);
    ReservationResponseDto getReservationByCode(String code);
    List<ReservationResponseDto> getAllReservations();
    List<ReservationResponseDto> getReservationsByAsset(Long assetId);
    ReservationResponseDto updateReservation(Long id, UpdateReservationRequestDto request);
    ReservationResponseDto dispatchReservation(Long id);
    ReservationResponseDto completeReservation(Long id);
    ReservationResponseDto cancelReservation(Long id);
    void deleteReservation(Long id);
}
