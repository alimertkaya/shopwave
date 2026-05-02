package com.alimertkaya.shipping.application.service;

import com.alimertkaya.shipping.api.response.ShipmentResponse;

import java.util.List;

public interface ShipmentQueryService {

    /**
     * Tüm kargo kayıtlarını döndürür (admin).
     *
     * @return Kargo listesi
     */
    List<ShipmentResponse> getAllShipments();
}
