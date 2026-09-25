package com.reservehub.enterprise.infrastructure.web.controller;

import com.reservehub.enterprise.domain.model.Asset;
import com.reservehub.enterprise.domain.model.Depot;
import com.reservehub.enterprise.domain.port.out.AssetRepositoryPort;
import com.reservehub.enterprise.domain.port.out.DepotRepositoryPort;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/depots")
@RequiredArgsConstructor
@Tag(name = "3. Depots & Hospitality", description = "Regional Hospitality Infrastructure Hubs")
public class DepotController {

    private final DepotRepositoryPort depotRepositoryPort;
    private final AssetRepositoryPort assetRepositoryPort;

    @GetMapping
    @Operation(summary = "Get Regional Depots", description = "Retrieves live telemetry and capacity metrics for Chicago ORD-01, Atlanta ATL-04, and Dallas DFW-02.")
    public ResponseEntity<List<Depot>> getAllDepots() {
        return ResponseEntity.ok(depotRepositoryPort.findAll());
    }

    @GetMapping("/{id}/assets")
    @Operation(summary = "List Assets in Depot Hub", description = "Returns the Hospitality Suites assigned to depot.")
    public ResponseEntity<List<Asset>> getAssetsByDepot(@PathVariable("id") Long id) {
        return ResponseEntity.ok(assetRepositoryPort.findByDepotId(id));
    }
}
