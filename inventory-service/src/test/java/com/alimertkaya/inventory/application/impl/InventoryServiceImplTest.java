package com.alimertkaya.inventory.application.impl;

import com.alimertkaya.inventory.api.request.InventoryRequest;
import com.alimertkaya.inventory.api.request.ReserveStockPayload;
import com.alimertkaya.inventory.api.response.InventoryResponse;
import com.alimertkaya.inventory.application.mapper.InventoryMapper;
import com.alimertkaya.inventory.domain.entity.Inventory;
import com.alimertkaya.inventory.domain.entity.OutboxEvent;
import com.alimertkaya.inventory.domain.entity.ProcessedEvent;
import com.alimertkaya.inventory.domain.exception.EntityNotFoundException;
import com.alimertkaya.inventory.infrastructure.repository.InventoryRepository;
import com.alimertkaya.inventory.infrastructure.repository.OutboxRepository;
import com.alimertkaya.inventory.infrastructure.repository.ProcessedEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceImplTest {

    @Mock private InventoryRepository inventoryRepository;
    @Mock private InventoryMapper inventoryMapper;
    @Mock private ProcessedEventRepository processedEventRepository;
    @Mock private OutboxRepository outboxRepository;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    private UUID productId;
    private UUID orderId;
    private UUID eventId;
    private Inventory inventory;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        orderId   = UUID.randomUUID();
        eventId   = UUID.randomUUID();
        inventory = new Inventory();
        inventory.setProductId(productId);
        inventory.setQuantity(10);
    }

    // ─── addStock ─────────────────────────────────────────────────────────────────

    @Test
    void addStock_whenStockAlreadyExists_thenQuantityIncreased() {
        // given
        InventoryRequest request = new InventoryRequest(productId, 5);
        when(inventoryRepository.findByProductId(productId)).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(inventory)).thenReturn(inventory);
        when(inventoryMapper.toResponse(inventory)).thenReturn(new InventoryResponse(UUID.randomUUID(), productId, 15));

        // when
        InventoryResponse result = inventoryService.addStock(request);

        // then
        assertThat(inventory.getQuantity()).isEqualTo(15); // 10 + 5
        assertThat(result.quantity()).isEqualTo(15);
    }

    @Test
    void addStock_whenStockNotExists_thenNewRecordCreated() {
        // given
        InventoryRequest request = new InventoryRequest(productId, 20);
        when(inventoryRepository.findByProductId(productId)).thenReturn(Optional.empty());
        when(inventoryMapper.toEntity(request)).thenReturn(inventory);
        when(inventoryRepository.save(inventory)).thenReturn(inventory);
        when(inventoryMapper.toResponse(inventory)).thenReturn(new InventoryResponse(UUID.randomUUID(), productId, 20));

        // when
        InventoryResponse result = inventoryService.addStock(request);

        // then
        assertThat(result.quantity()).isEqualTo(20);
        verify(inventoryMapper).toEntity(request);
    }

    // ─── getStockByProductId ──────────────────────────────────────────────────────

    @Test
    void getStockByProductId_whenFound_thenReturnStock() {
        // given
        when(inventoryRepository.findByProductId(productId)).thenReturn(Optional.of(inventory));
        when(inventoryMapper.toResponse(inventory)).thenReturn(new InventoryResponse(UUID.randomUUID(), productId, 10));

        // when
        InventoryResponse result = inventoryService.getStockByProductId(productId);

        // then
        assertThat(result.productId()).isEqualTo(productId);
        assertThat(result.quantity()).isEqualTo(10);
    }

    @Test
    void getStockByProductId_whenNotFound_thenThrowsEntityNotFoundException() {
        // given
        when(inventoryRepository.findByProductId(productId)).thenReturn(Optional.empty());

        // when / then
        assertThatThrownBy(() -> inventoryService.getStockByProductId(productId))
                .isInstanceOf(EntityNotFoundException.class);
    }

    // ─── reserveStock ─────────────────────────────────────────────────────────────

    @Test
    void reserveStock_whenStockSufficient_thenStockReducedAndSuccessEventPublished() {
        // given
        ReserveStockPayload payload = new ReserveStockPayload(orderId, productId, 3);
        when(processedEventRepository.existsByEventId(eventId)).thenReturn(false);
        when(inventoryRepository.findByProductId(productId)).thenReturn(Optional.of(inventory)); // quantity=10

        // when
        inventoryService.reserveStock(eventId, payload);

        // then
        assertThat(inventory.getQuantity()).isEqualTo(7); // 10 - 3
        ArgumentCaptor<OutboxEvent> captor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxRepository).save(captor.capture());
        assertThat(captor.getValue().getEventType()).isEqualTo("stock.reserved");
        verify(processedEventRepository).save(any(ProcessedEvent.class));
    }

    @Test
    void reserveStock_whenStockInsufficient_thenFailedEventPublished() {
        // given
        ReserveStockPayload payload = new ReserveStockPayload(orderId, productId, 999);
        when(processedEventRepository.existsByEventId(eventId)).thenReturn(false);
        when(inventoryRepository.findByProductId(productId)).thenReturn(Optional.of(inventory)); // quantity=10

        // when
        inventoryService.reserveStock(eventId, payload);

        // then — Saga compensation: yetersiz stok eventi yayınlandı
        ArgumentCaptor<OutboxEvent> captor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxRepository).save(captor.capture());
        assertThat(captor.getValue().getEventType()).isEqualTo("stock.reserve.failed");
    }

    @Test
    void reserveStock_whenDuplicateEvent_thenIgnored() {
        // given
        ReserveStockPayload payload = new ReserveStockPayload(orderId, productId, 3);
        when(processedEventRepository.existsByEventId(eventId)).thenReturn(true);

        // when
        inventoryService.reserveStock(eventId, payload);

        // then — Idempotency garantisi
        verifyNoInteractions(inventoryRepository);
        verifyNoInteractions(outboxRepository);
    }
}
