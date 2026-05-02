package com.alimertkaya.shipping.api.controller;

import com.alimertkaya.shipping.api.response.ShipmentResponse;
import com.alimertkaya.shipping.application.service.ShipmentQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentQueryService shipmentQueryService;

    @GetMapping
    public List<ShipmentResponse> getAllShipments() {
        return shipmentQueryService.getAllShipments();
    }
}
