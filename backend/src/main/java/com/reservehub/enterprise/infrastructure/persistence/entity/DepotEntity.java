package com.reservehub.enterprise.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "depots")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepotEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String code; // ORD-01, ATL-04, DFW-02

    @Column(nullable = false, length = 128)
    private String name;

    @Column(length = 64)
    private String city;

    @Column(length = 32)
    private String state;

    /** Full street address of the facility */
    @Column(name = "address", length = 255)
    private String address;

    /** Full name and title of the facility supervisor */
    @Column(name = "supervisor_name", length = 128)
    private String supervisorName;

    /** Phone contact for the supervisor */
    @Column(name = "supervisor_phone", length = 32)
    private String supervisorPhone;

    /** Operating status: OPERATIONAL, LIMITED, MAINTENANCE */
    @Column(name = "operating_status", length = 32)
    private String operatingStatus;

    @Column(name = "suites_capacity")
    private int suitesCapacity;

    @Column(name = "suites_active")
    private int suitesActive;

    @Column(name = "utilization_rate")
    private double activeUtilizationRate;
}
