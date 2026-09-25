package com.reservehub.enterprise.domain.port.out;

import com.reservehub.enterprise.domain.model.Asset;

import java.util.List;
import java.util.Optional;

/**
 * Outbound port for Asset hardware and IoT registry.
 */
public interface AssetRepositoryPort {
    Optional<Asset> findById(Long id);
    Optional<Asset> findByAssetIdentifier(String identifier);
    List<Asset> findAll();
    List<Asset> findByDepotId(Long depotId);
    Asset save(Asset asset);
}
