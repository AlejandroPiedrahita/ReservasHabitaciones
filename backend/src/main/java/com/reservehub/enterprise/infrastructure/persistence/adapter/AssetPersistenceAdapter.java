package com.reservehub.enterprise.infrastructure.persistence.adapter;

import com.reservehub.enterprise.domain.model.Asset;
import com.reservehub.enterprise.domain.port.out.AssetRepositoryPort;
import com.reservehub.enterprise.infrastructure.persistence.entity.AssetEntity;
import com.reservehub.enterprise.infrastructure.persistence.repository.AssetJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AssetPersistenceAdapter implements AssetRepositoryPort {

    private final AssetJpaRepository jpaRepository;

    @Override
    public Optional<Asset> findById(Long id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Asset> findByAssetIdentifier(String identifier) {
        return jpaRepository.findByAssetIdentifier(identifier).map(this::toDomain);
    }

    @Override
    public List<Asset> findAll() {
        return jpaRepository.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public List<Asset> findByDepotId(Long depotId) {
        return jpaRepository.findByDepotId(depotId).stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public Asset save(Asset asset) {
        AssetEntity entity = AssetEntity.builder()
                .id(asset.getId())
                .assetIdentifier(asset.getAssetIdentifier())
                .name(asset.getName())
                .type(asset.getType())
                .category(asset.getCategory())
                .depotId(asset.getDepotId())
                .depotCode(asset.getDepotCode())
                .baseHourlyRate(asset.getBaseHourlyRate())
                .pricePerNight(asset.getPricePerNight())
                .status(asset.getStatus())
                .iotLockId(asset.getIotLockId())
                .cleanlinessScore(asset.getCleanlinessScore())
                .conditionReport(asset.getConditionReport())
                .capacityPersons(asset.getCapacityPersons())
                .floor(asset.getFloor())
                .notes(asset.getNotes())
                .amenities(asset.getAmenities())
                .lastSanitizedAt(asset.getLastSanitizedAt())
                .createdAt(asset.getCreatedAt())
                .updatedAt(asset.getUpdatedAt())
                .build();
        return toDomain(jpaRepository.save(entity));
    }

    private Asset toDomain(AssetEntity entity) {
        return Asset.builder()
                .id(entity.getId())
                .assetIdentifier(entity.getAssetIdentifier())
                .name(entity.getName())
                .type(entity.getType())
                .category(entity.getCategory())
                .depotId(entity.getDepotId())
                .depotCode(entity.getDepotCode())
                .baseHourlyRate(entity.getBaseHourlyRate())
                .pricePerNight(entity.getPricePerNight())
                .status(entity.getStatus())
                .iotLockId(entity.getIotLockId())
                .cleanlinessScore(entity.getCleanlinessScore())
                .conditionReport(entity.getConditionReport())
                .capacityPersons(entity.getCapacityPersons())
                .floor(entity.getFloor())
                .notes(entity.getNotes())
                .amenities(entity.getAmenities())
                .lastSanitizedAt(entity.getLastSanitizedAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
