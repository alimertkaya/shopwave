package com.alimertkaya.shipping.infrastructure.outbox;

import com.alimertkaya.shipping.domain.entity.OutboxEvent;
import com.alimertkaya.shipping.domain.enums.OutboxStatus;
import com.alimertkaya.shipping.infrastructure.repository.OutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxScheduler {

    private final OutboxRepository outboxRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Scheduled(fixedDelay = 10000)
    @Transactional
    public void publishPendingEvent() {
        List<OutboxEvent> pendingEvents = outboxRepository.findByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING);

        for (OutboxEvent event : pendingEvents) {
            try {
                // mesaj kafka topic e iletilir
                kafkaTemplate.send(event.getEventType(), event.getPayload());

                // basarili olursa durumu guncelle
                event.setStatus(OutboxStatus.PUBLISHED);
                event.setPublishedAt(LocalDateTime.now());
                log.info("Outbox mesajı Kafka'ya gönderildi. Event ID: {}, Topic: {}", event.getEventId(), event.getEventType());
            } catch (Exception e) {
                log.error("Outbox mesajı gönderilemedi. Event ID: {}", event.getEventId(), e);
            }
        }
        outboxRepository.saveAll(pendingEvents);
    }
}
