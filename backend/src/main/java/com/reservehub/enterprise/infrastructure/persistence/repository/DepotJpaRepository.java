package com.reservehub.enterprise.infrastructure.persistence.repository;

import com.reservehub.enterprise.infrastructure.persistence.entity.DepotEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepotJpaRepository extends JpaRepository<DepotEntity, Long> {
    Optional<DepotEntity> findByCode(String code);
}
