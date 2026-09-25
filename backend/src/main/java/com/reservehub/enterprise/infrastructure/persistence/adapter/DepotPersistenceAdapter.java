package com.reservehub.enterprise.infrastructure.persistence.adapter;

import com.reservehub.enterprise.domain.model.Depot;
import com.reservehub.enterprise.domain.port.out.DepotRepositoryPort;
import com.reservehub.enterprise.infrastructure.persistence.entity.DepotEntity;
import com.reservehub.enterprise.infrastructure.persistence.repository.DepotJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DepotPersistenceAdapter implements DepotRepositoryPort {

    private final DepotJpaRepository jpaRepository;

    @Override
    public List<Depot> findAll() {
        return jpaRepository.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public Optional<Depot> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Depot> findByCode(String code) {
        return jpaRepository.findByCode(code).map(this::toDomain);
    }

    @Override
    public Depot save(Depot depot) {
        DepotEntity entity = DepotEntity.builder()
                .id(depot.getId())
                .code(depot.getCode())
                .name(depot.getName())
                .city(depot.getCity())
                .state(depot.getState())
                .address(depot.getAddress())
                .supervisorName(depot.getSupervisorName())
                .supervisorPhone(depot.getSupervisorPhone())
                .operatingStatus(depot.getOperatingStatus())
                .suitesCapacity(depot.getSuitesCapacity())
                .suitesActive(depot.getSuitesActive())
                .activeUtilizationRate(depot.getActiveUtilizationRate())
                .build();
        return toDomain(jpaRepository.save(entity));
    }

    private Depot toDomain(DepotEntity entity) {
        return Depot.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .city(entity.getCity())
                .state(entity.getState())
                .address(entity.getAddress())
                .supervisorName(entity.getSupervisorName())
                .supervisorPhone(entity.getSupervisorPhone())
                .operatingStatus(entity.getOperatingStatus())
                .suitesCapacity(entity.getSuitesCapacity())
                .suitesActive(entity.getSuitesActive())
                .activeUtilizationRate(entity.getActiveUtilizationRate())
                .build();
    }
}
