package com.alimertkaya.shipping.infrastructure.repository;

import com.alimertkaya.shipping.domain.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {
}
