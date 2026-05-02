package com.alimertkaya.shipping.infrastructure.repository;

import com.alimertkaya.shipping.domain.entity.OutboxEvent;
import com.alimertkaya.shipping.domain.enums.OutboxStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OutboxRepository extends JpaRepository<OutboxEvent, UUID> {
    List<OutboxEvent> findByStatusOrderByCreatedAtAsc(OutboxStatus status);
}
