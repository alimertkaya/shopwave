package com.alimertkaya.inventory.infrastructure.repository;

import com.alimertkaya.inventory.domain.entity.ProcessedEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProcessedEventRepository extends JpaRepository<ProcessedEvent, UUID> {
    boolean existsByEventId(UUID eventId);
}