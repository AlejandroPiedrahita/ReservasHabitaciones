package com.reservehub.enterprise.infrastructure.persistence.repository;

import com.reservehub.enterprise.infrastructure.persistence.entity.SystemSettingsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemSettingsJpaRepository extends JpaRepository<SystemSettingsEntity, Long> {
}
