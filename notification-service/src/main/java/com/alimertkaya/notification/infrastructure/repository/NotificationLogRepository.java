package com.alimertkaya.notification.infrastructure.repository;

import com.alimertkaya.notification.domain.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, UUID> {
    boolean existsByEventId(UUID eventId);
}