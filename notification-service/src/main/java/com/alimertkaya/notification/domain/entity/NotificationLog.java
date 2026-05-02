package com.alimertkaya.notification.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID eventId; // Aynı mesajı iki kere atmamak için (Idempotency)

    @Column(nullable = false)
    private UUID orderId;

    @Column(nullable = false)
    private String notificationType; // SMS, EMAIL

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(name = "sent_at", updatable = false)
    private LocalDateTime sentAt;

    @PrePersist
    protected void onCreate() {
        this.sentAt = LocalDateTime.now();
    }
}