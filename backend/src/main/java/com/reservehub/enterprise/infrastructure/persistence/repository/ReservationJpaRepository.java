package com.reservehub.enterprise.infrastructure.persistence.repository;

import com.reservehub.enterprise.domain.model.enums.ReservationStatus;
import com.reservehub.enterprise.infrastructure.persistence.entity.ReservationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationJpaRepository extends JpaRepository<ReservationEntity, Long> {

    Optional<ReservationEntity> findByReservationCode(String reservationCode);

    List<ReservationEntity> findByAssetId(Long assetId);

    /**
     * Efficient database query to detect active overlapping allocations on a given asset.
     * Overlap condition: r.startTime < :candidateEnd AND r.endTime > :candidateStart
     */
    @Query("SELECT r FROM ReservationEntity r WHERE r.assetId = :assetId " +
           "AND r.status NOT IN (:excludedStatuses) " +
           "AND r.startTime < :candidateEnd AND r.endTime > :candidateStart")
    List<ReservationEntity> findOverlapping(
            @Param("assetId") Long assetId,
            @Param("candidateStart") LocalDateTime candidateStart,
            @Param("candidateEnd") LocalDateTime candidateEnd,
            @Param("excludedStatuses") List<ReservationStatus> excludedStatuses
    );
}
