package com.alimertkaya.shipping.application.impl;

import com.alimertkaya.shipping.api.dto.StartShipmentPayload;
import com.alimertkaya.shipping.domain.entity.OutboxEvent;
import com.alimertkaya.shipping.domain.entity.ProcessedEvent;
import com.alimertkaya.shipping.domain.entity.Shipment;
import com.alimertkaya.shipping.infrastructure.repository.OutboxRepository;
import com.alimertkaya.shipping.infrastructure.repository.ProcessedEventRepository;
import com.alimertkaya.shipping.infrastructure.repository.ShipmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShippingServiceImplTest {

    @Mock private ShipmentRepository shipmentRepository;
    @Mock private OutboxRepository outboxRepository;
    @Mock private ProcessedEventRepository processedEventRepository;

    @InjectMocks
    private ShippingServiceImpl shippingService;

    private UUID eventId;
    private UUID orderId;

    @BeforeEach
    void setUp() {
        eventId = UUID.randomUUID();
        orderId = UUID.randomUUID();
    }

    // ─── startShipment ────────────────────────────────────────────────────────────

    @Test
    void startShipment_whenNewEvent_thenShipmentSavedAndEventPublished() {
        // given
        StartShipmentPayload payload = new StartShipmentPayload(orderId);
        when(processedEventRepository.existsByEventId(eventId)).thenReturn(false);

        // when
        shippingService.startShipment(eventId, payload);

        // then — Kargo kaydedildi
        ArgumentCaptor<Shipment> shipmentCaptor = ArgumentCaptor.forClass(Shipment.class);
        verify(shipmentRepository).save(shipmentCaptor.capture());
        Shipment saved = shipmentCaptor.getValue();
        assertThat(saved.getOrderId()).isEqualTo(orderId);
        assertThat(saved.getTrackingNumber()).startsWith("SHP-");

        // then — Outbox'a 'shipment.started' yazıldı
        ArgumentCaptor<OutboxEvent> outboxCaptor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxRepository).save(outboxCaptor.capture());
        assertThat(outboxCaptor.getValue().getEventType()).isEqualTo("shipment.started");
        assertThat(outboxCaptor.getValue().getPayload()).contains(saved.getTrackingNumber());

        // then — İşlenmiş olarak işaretlendi
        verify(processedEventRepository).save(any(ProcessedEvent.class));
    }

    @Test
    void startShipment_whenDuplicateEvent_thenIgnored() {
        // given
        StartShipmentPayload payload = new StartShipmentPayload(orderId);
        when(processedEventRepository.existsByEventId(eventId)).thenReturn(true);

        // when
        shippingService.startShipment(eventId, payload);

        // then — Idempotency: hiçbir şey kaydedilmemeli
        verifyNoInteractions(shipmentRepository);
        verifyNoInteractions(outboxRepository);
        verify(processedEventRepository, never()).save(any());
    }
}
