package com.reservehub.enterprise.infrastructure.config;

import com.reservehub.enterprise.domain.model.enums.AssetType;
import com.reservehub.enterprise.domain.model.enums.ReservationStatus;
import com.reservehub.enterprise.domain.model.enums.Role;
import com.reservehub.enterprise.infrastructure.persistence.entity.AssetEntity;
import com.reservehub.enterprise.infrastructure.persistence.entity.DepotEntity;
import com.reservehub.enterprise.infrastructure.persistence.entity.ReservationEntity;
import com.reservehub.enterprise.infrastructure.persistence.entity.UserEntity;
import com.reservehub.enterprise.infrastructure.persistence.repository.AssetJpaRepository;
import com.reservehub.enterprise.infrastructure.persistence.repository.DepotJpaRepository;
import com.reservehub.enterprise.infrastructure.persistence.repository.ReservationJpaRepository;
import com.reservehub.enterprise.infrastructure.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserJpaRepository userRepository;
    private final DepotJpaRepository depotRepository;
    private final AssetJpaRepository assetRepository;
    private final ReservationJpaRepository reservationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded with enterprise baseline.");
            return;
        }

        log.info("Bootstrapping ReserveHub Enterprise database baseline data...");

        // 1. Seed Users (Credentials explicitly matching Stitch UI and prompt requirements)
        UserEntity admin = UserEntity.builder()
                .email("m.armstrong@enterprise-reservehub.net")
                .passwordHash(passwordEncoder.encode("DispatcherKey#2025$Auth"))
                .fullName("Marcus Armstrong")
                .department("Hospitality Operations & Guest Services")
                .role(Role.ROLE_ADMIN)
                .mfaEnabled(true)
                .mfaSecret("BASE32TOTPSECRETKEY")
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(admin);

        UserEntity client = UserEntity.builder()
                .email("sarah.jenkins@acme-enterprises.com")
                .passwordHash(passwordEncoder.encode("ClientPass#2025$Secure"))
                .fullName("Sarah Jenkins")
                .department("Corporate Procurement")
                .role(Role.ROLE_CLIENTE)
                .mfaEnabled(false)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(client);

        // 2. Seed Depots (From Stitch Overview UI)
        DepotEntity chicago = DepotEntity.builder()
                .code("ORD-01")
                .name("Chicago Central Hospitality Hub")
                .city("Chicago")
                .state("IL")
                .suitesCapacity(100)
                .suitesActive(95)
                .activeUtilizationRate(94.8)
                .build();
        chicago = depotRepository.save(chicago);

        DepotEntity atlanta = DepotEntity.builder()
                .code("ATL-04")
                .name("Atlanta Hospitality Center")
                .city("Atlanta")
                .state("GA")
                .suitesCapacity(90)
                .suitesActive(82)
                .activeUtilizationRate(91.4)
                .build();
        atlanta = depotRepository.save(atlanta);

        DepotEntity dallas = DepotEntity.builder()
                .code("DFW-02")
                .name("Dallas Hospitality & Suites Depot")
                .city("Dallas")
                .state("TX")
                .suitesCapacity(75)
                .suitesActive(64)
                .activeUtilizationRate(87.5)
                .build();
        dallas = depotRepository.save(dallas);

        // 3. Seed Assets
        AssetEntity suite14B = AssetEntity.builder()
                .assetIdentifier("ROOM-ORD-14B")
                .name("Highland Reserve Executive Suite 14B")
                .type(AssetType.HOSPITALITY_SUITE)
                .depotId(chicago.getId())
                .depotCode(chicago.getCode())
                .baseHourlyRate(new BigDecimal("350.00"))
                .status("ACTIVE")
                .iotLockId("LOCK-IOT-9921")
                .cleanlinessScore(100.0)
                .conditionReport("IoT smart lock connected. Turnaround cleaning inspected.")
                .build();
        suite14B = assetRepository.save(suite14B);

        AssetEntity suite201 = AssetEntity.builder()
                .assetIdentifier("ROOM-ATL-201")
                .name("PeachTree Presidential Suite 201")
                .type(AssetType.HOSPITALITY_SUITE)
                .depotId(atlanta.getId())
                .depotCode(atlanta.getCode())
                .baseHourlyRate(new BigDecimal("420.00"))
                .status("ACTIVE")
                .iotLockId("LOCK-IOT-4411")
                .cleanlinessScore(98.0)
                .conditionReport("Quality inspection completed. IoT lock synced with JWT token.")
                .build();
        suite201 = assetRepository.save(suite201);

        // 4. Seed Initial Reservations
        ReservationEntity res1 = ReservationEntity.builder()
                .reservationCode("RES-2026-9811")
                .assetId(suite14B.getId())
                .assetIdentifier(suite14B.getAssetIdentifier())
                .assetName(suite14B.getName())
                .depotId(chicago.getId())
                .depotCode(chicago.getCode())
                .userId(admin.getId())
                .userEmail(admin.getEmail())
                .customerName("Apex Enterprises Global")
                .startTime(LocalDateTime.now().minusHours(2))
                .endTime(LocalDateTime.now().plusHours(10))
                .status(ReservationStatus.IN_TRANSIT)
                .baseCost(new BigDecimal("1850.00"))
                .serviceFee(new BigDecimal("78.62"))
                .insuranceFee(new BigDecimal("85.00"))
                .totalAmount(new BigDecimal("2013.62"))
                .destinationOrRoom("Suite 14B (Floor 3, ORD-01)")
                .manifestNotes("Executive suite reservation for corporate delegation.")
                .assignedConcierge("Central Concierge (Morning Shift)")
                .createdAt(LocalDateTime.now().minusDays(1))
                .updatedAt(LocalDateTime.now())
                .build();
        reservationRepository.save(res1);

        ReservationEntity res2 = ReservationEntity.builder()
                .reservationCode("RES-2026-4412")
                .assetId(suite201.getId())
                .assetIdentifier(suite201.getAssetIdentifier())
                .assetName(suite201.getName())
                .depotId(atlanta.getId())
                .depotCode(atlanta.getCode())
                .userId(client.getId())
                .userEmail(client.getEmail())
                .customerName("Acme Strategic Partners")
                .startTime(LocalDateTime.now().plusHours(4))
                .endTime(LocalDateTime.now().plusHours(12))
                .status(ReservationStatus.CONFIRMED)
                .baseCost(new BigDecimal("3360.00"))
                .serviceFee(new BigDecimal("142.80"))
                .insuranceFee(new BigDecimal("85.00"))
                .totalAmount(new BigDecimal("3587.80"))
                .destinationOrRoom("Presidential Suite 201 (Floor 4)")
                .manifestNotes("VIP corporate hospitality stay with white-glove service.")
                .assignedConcierge("VIP Concierge (White-Glove)")
                .createdAt(LocalDateTime.now().minusHours(3))
                .updatedAt(LocalDateTime.now())
                .build();
        reservationRepository.save(res2);

        log.info("ReserveHub Enterprise baseline bootstrap complete.");
    }
}
