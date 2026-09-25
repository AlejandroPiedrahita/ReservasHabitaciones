package com.reservehub.enterprise.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Regional hospitality hub domain entity (Chicago ORD-01, Atlanta ATL-04, Dallas DFW-02).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Depot {
    private Long id;
    private String code;
    private String name;
    private String city;
    private String state;
    private String address;
    private String supervisorName;
    private String supervisorPhone;
    private String operatingStatus;
    private int suitesCapacity;
    private int suitesActive;
    private double activeUtilizationRate;
}
