package com.reservehub.enterprise.infrastructure.persistence.adapter;

import com.reservehub.enterprise.domain.model.Reservation;
import com.reservehub.enterprise.domain.model.enums.PaymentStatus;
import com.reservehub.enterprise.domain.model.enums.ReservationStatus;
import com.reservehub.enterprise.domain.port.out.ReservationRepositoryPort;
import com.reservehub.enterprise.infrastructure.persistence.entity.ReservationEntity;
import com.reservehub.enterprise.infrastructure.persistence.repository.ReservationJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Clean Architecture Persistence Adapter translating between Domain Aggregate and JPA Entity.
 */
@Component
@RequiredArgsConstructor
public class ReservationPersistenceAdapter implements ReservationRepositoryPort {

    private final ReservationJpaRepository jpaRepository;

    @Override
    public Reservation save(Reservation domain) {
        ReservationEntity entity = toEntity(domain);
        ReservationEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Reservation> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Reservation> findByReservationCode(String code) {
        return jpaRepository.findByReservationCode(code).map(this::toDomain);
    }

    @Override
    public List<Reservation> findAll() {
        return jpaRepository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Reservation> findByAssetId(Long assetId) {
        return jpaRepository.findByAssetId(assetId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Reservation> findOverlappingReservations(Long assetId, LocalDateTime start, LocalDateTime end) {
        List<ReservationStatus> excluded = Arrays.asList(ReservationStatus.CANCELLED, ReservationStatus.COMPLETED);
        return jpaRepository.findOverlapping(assetId, start, end, excluded).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    private ReservationEntity toEntity(Reservation domain) {
        return ReservationEntity.builder()
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
                .paymentStatus(domain.getPaymentStatus() != null ? domain.getPaymentStatus() : PaymentStatus.UNPAID)
                .paidAt(domain.getPaidAt())
                .paymentMethod(domain.getPaymentMethod())
                .paymentLast4(domain.getPaymentLast4())
                .paymentTxId(domain.getPaymentTxId())
                // Audit
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }

    private Reservation toDomain(ReservationEntity entity) {
        return Reservation.builder()
                .id(entity.getId())
                .reservationCode(entity.getReservationCode())
                .assetId(entity.getAssetId())
                .assetIdentifier(entity.getAssetIdentifier())
                .assetName(entity.getAssetName())
                .depotId(entity.getDepotId())
                .depotCode(entity.getDepotCode())
                .userId(entity.getUserId())
                .userEmail(entity.getUserEmail())
                .customerName(entity.getCustomerName())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .status(entity.getStatus())
                .baseCost(entity.getBaseCost())
                .serviceFee(entity.getServiceFee())
                .insuranceFee(entity.getInsuranceFee())
                .totalAmount(entity.getTotalAmount())
                .destinationOrRoom(entity.getDestinationOrRoom())
                .manifestNotes(entity.getManifestNotes())
                .assignedConcierge(entity.getAssignedConcierge())
                // Payment fields
                .paymentStatus(entity.getPaymentStatus() != null ? entity.getPaymentStatus() : PaymentStatus.UNPAID)
                .paidAt(entity.getPaidAt())
                .paymentMethod(entity.getPaymentMethod())
                .paymentLast4(entity.getPaymentLast4())
                .paymentTxId(entity.getPaymentTxId())
                // Audit
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
