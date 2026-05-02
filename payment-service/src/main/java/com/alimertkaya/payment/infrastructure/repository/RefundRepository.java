package com.alimertkaya.payment.infrastructure.repository;

import com.alimertkaya.payment.domain.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RefundRepository extends JpaRepository<Refund, UUID> {
    boolean existsByOrderId(UUID orderId);
}
