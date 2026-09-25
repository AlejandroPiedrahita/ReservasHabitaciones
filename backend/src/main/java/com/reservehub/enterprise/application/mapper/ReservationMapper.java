package com.reservehub.enterprise.application.mapper;

import com.reservehub.enterprise.application.dto.request.CreateReservationRequestDto;
import com.reservehub.enterprise.application.dto.response.ReservationResponseDto;
import com.reservehub.enterprise.domain.model.Reservation;
import com.reservehub.enterprise.domain.model.enums.ReservationStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Clean mapper between Domain Aggregate and DTO representations without leaking ORM specifics.
 */
@Component
public class ReservationMapper {

    public Reservation toDomain(CreateReservationRequestDto dto, String userEmail, BigDecimal baseRate) {
        String reservationCode = "RES-" + LocalDateTime.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        
        // Dynamic calculations matching Stitch pricing policies
        BigDecimal serviceFee = baseRate.multiply(new BigDecimal("0.0425")); // +4.25% sanitation/service fee
        BigDecimal insurance = new BigDecimal("85.00");
        BigDecimal total = baseRate.add(serviceFee).add(insurance);

        return Reservation.builder()
                .reservationCode(reservationCode)
                .assetId(dto.getAssetId())
                .depotId(dto.getDepotId())
                .userEmail(userEmail)
                .customerName(dto.getCustomerName())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .status(ReservationStatus.CONFIRMED)
                .baseCost(baseRate)
                .serviceFee(serviceFee)
                .insuranceFee(insurance)
                .totalAmount(total)
                .destinationOrRoom(dto.getDestinationOrRoom())
                .manifestNotes(dto.getManifestNotes())
                .assignedConcierge(dto.getAssignedConcierge() != null ? dto.getAssignedConcierge() : "Unassigned - Auto-Assign Pending")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    public ReservationResponseDto toDto(Reservation domain) {
        return ReservationResponseDto.builder()
                .id(domain.getId())
                .reservationCode(domain.getReservationCode())
                .assetId(domain.getAssetId())
                .assetIdentifier(domain.getAssetIdentifier())
                .assetName(domain.getAssetName())
                .depotId(domain.getDepotId())
                .depotCode(domain.getDepotCode())
                .userId(domain.getUserId())
                .userEmail(domain.getUserEmail())
                .customerName(domain.getCustomerName())
                .startTime(domain.getStartTime())
                .endTime(domain.getEndTime())
                .status(domain.getStatus())
                .baseCost(domain.getBaseCost())
                .serviceFee(domain.getServiceFee())
                .insuranceFee(domain.getInsuranceFee())
                .totalAmount(domain.getTotalAmount())
                .destinationOrRoom(domain.getDestinationOrRoom())
                .manifestNotes(domain.getManifestNotes())
                .assignedConcierge(domain.getAssignedConcierge())
                // Payment fields
                .paymentStatus(domain.getPaymentStatus())
                .paidAt(domain.getPaidAt())
                .paymentMethod(domain.getPaymentMethod())
                .paymentLast4(domain.getPaymentLast4())
                .paymentTxId(domain.getPaymentTxId())
                // Audit
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }
}
