package com.reservehub.enterprise.domain.port.out;

import com.reservehub.enterprise.domain.model.Depot;

import java.util.List;
import java.util.Optional;

/**
 * Outbound port for regional transportation and hospitality depots.
 */
public interface DepotRepositoryPort {
    List<Depot> findAll();
    Optional<Depot> findById(Long id);
    Optional<Depot> findByCode(String code);
    Depot save(Depot depot);
}
