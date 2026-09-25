package com.reservehub.enterprise.infrastructure.persistence.repository;

import com.reservehub.enterprise.infrastructure.persistence.entity.TelemetryAlertEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TelemetryAlertJpaRepository extends JpaRepository<TelemetryAlertEntity, String> {
    List<TelemetryAlertEntity> findByResolvedFalseOrderByTimestampDesc();
    List<TelemetryAlertEntity> findAllByOrderByTimestampDesc();
}
