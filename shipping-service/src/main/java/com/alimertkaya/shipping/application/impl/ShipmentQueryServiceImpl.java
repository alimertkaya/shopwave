package com.alimertkaya.shipping.application.impl;

import com.alimertkaya.shipping.api.response.ShipmentResponse;
import com.alimertkaya.shipping.application.service.ShipmentQueryService;
import com.alimertkaya.shipping.infrastructure.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShipmentQueryServiceImpl implements ShipmentQueryService {

    private final ShipmentRepository shipmentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ShipmentResponse> getAllShipments() {
        return shipmentRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(s -> new ShipmentResponse(s.getId(), s.getOrderId(), s.getTrackingNumber(),
                        s.getStatus().name(), s.getCreatedAt()))
                .toList();
    }
}
