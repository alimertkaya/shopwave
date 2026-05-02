package com.alimertkaya.inventory.application.impl;

import com.alimertkaya.inventory.api.request.InventoryRequest;
import com.alimertkaya.inventory.api.request.ReserveStockPayload;
import com.alimertkaya.inventory.api.response.InventoryResponse;
import com.alimertkaya.inventory.application.mapper.InventoryMapper;
import com.alimertkaya.inventory.application.service.InventoryService;
import com.alimertkaya.inventory.domain.entity.Inventory;
import com.alimertkaya.inventory.domain.entity.OutboxEvent;
import com.alimertkaya.inventory.domain.entity.ProcessedEvent;
import com.alimertkaya.inventory.domain.enums.OutboxStatus;
import com.alimertkaya.inventory.domain.exception.EntityNotFoundException;
import com.alimertkaya.inventory.infrastructure.repository.InventoryRepository;
import com.alimertkaya.inventory.infrastructure.repository.OutboxRepository;
import com.alimertkaya.inventory.infrastructure.repository.ProcessedEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryMapper inventoryMapper;
    private final ProcessedEventRepository processedEventRepository;
    private final OutboxRepository outboxRepository;

    @Override
    @Transactional
    public InventoryResponse addStock(InventoryRequest request) {
        Optional<Inventory> existingInventory = inventoryRepository.findByProductId(request.productId());

        Inventory inventory;
        if (existingInventory.isPresent()) {
            inventory = existingInventory.get();
            inventory.setQuantity(inventory.getQuantity() + request.quantity());
            log.info("Ürün {} için stok güncellendi. Yeni miktar: {}", request.productId(), inventory.getQuantity());
        } else {
            inventory = inventoryMapper.toEntity(request);
            log.info("Ürün {} için yeni stok kaydı açıldı.", request.productId());
        }
        return inventoryMapper.toResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getStockByProductId(UUID productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException("Bu ürün için stok kaydı bulunamadı."));
        return inventoryMapper.toResponse(inventory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> getAllInventories() {
        return inventoryRepository.findAll().stream()
                .map(inventoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> getLowStockInventories(int threshold) {
        return inventoryRepository.findByQuantityLessThanEqual(threshold).stream()
                .map(inventoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public InventoryResponse setStock(UUID productId, int quantity) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException("Bu ürün için stok kaydı bulunamadı."));
        inventory.setQuantity(quantity);
        log.info("Ürün {} stoku {} olarak ayarlandı.", productId, quantity);
        return inventoryMapper.toResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    public void reserveStock(UUID eventId, ReserveStockPayload payload) {
        if (processedEventRepository.existsByEventId(eventId)) {
            log.warn("Bu Kafka mesajı daha önce işlenmiş: {}", eventId);
            return;
        }

        log.info("Stok rezervasyonu isteniyor. Ürün: {}, Adet: {}", payload.productId(), payload.quantity());

        String nextTopic;

        Optional<Inventory> inventoryOpt = inventoryRepository.findByProductId(payload.productId());

        if (inventoryOpt.isPresent() && inventoryOpt.get().getQuantity() >= payload.quantity()) {
            // stok var
            Inventory inventory = inventoryOpt.get();
            inventory.setQuantity(inventory.getQuantity() - payload.quantity());
            inventoryRepository.save(inventory);

            nextTopic = "stock.reserved";
            log.info("Stok başarıyla rezerve edildi.");
        } else {
            nextTopic = "stock.reserve.failed";
            log.error("YETERSİZ STOK! Rezervasyon başarısız.");
        }

        UUID outboxEventId = UUID.randomUUID();
        OutboxEvent outboxEvent = OutboxEvent.builder()
                .eventId(outboxEventId)
                .eventType(nextTopic)
                .aggregateId(payload.orderId().toString())
                .payload("{\"eventId\":\"" + outboxEventId + "\",\"orderId\":\"" + payload.orderId() + "\"}")
                .status(OutboxStatus.PENDING)
                .build();
        outboxRepository.save(outboxEvent);

        processedEventRepository.save(ProcessedEvent.builder()
                .eventId(eventId)
                .eventType("reserve.stock")
                .processedAt(LocalDateTime.now())
                .build());
    }
}