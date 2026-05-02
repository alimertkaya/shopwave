package com.alimertkaya.inventory.application.service;

import com.alimertkaya.inventory.api.request.InventoryRequest;
import com.alimertkaya.inventory.api.request.ReserveStockPayload;
import com.alimertkaya.inventory.api.response.InventoryResponse;

import java.util.List;
import java.util.UUID;

public interface InventoryService {

    /**
     * Bir ürün için stok ekler. Ürün zaten kayıtlıysa mevcut miktarın üzerine ekler,
     * yoksa yeni bir stok kaydı oluşturur.
     *
     * @param request Ürün ID'si ve eklenecek miktarı içeren istek
     * @return Güncel stok bilgisini içeren yanıt
     */
    InventoryResponse addStock(InventoryRequest request);

    /**
     * Belirtilen ürüne ait güncel stok bilgisini döndürür.
     *
     * @param productId Stoku sorgulanacak ürünün ID'si
     * @return Mevcut stok bilgisi
     * @throws com.alimertkaya.inventory.domain.exception.EntityNotFoundException Stok kaydı bulunamazsa
     */
    InventoryResponse getStockByProductId(UUID productId);

    /**
     * Tüm stok kayıtlarını döndürür (admin).
     *
     * @return Stok listesi
     */
    List<InventoryResponse> getAllInventories();

    /**
     * Belirtilen eşiğin altındaki stokları döndürür (admin).
     *
     * @param threshold Eşik değeri
     * @return Düşük stoklu ürün listesi
     */
    List<InventoryResponse> getLowStockInventories(int threshold);

    /**
     * Sipariş için stok rezervasyonu yapar (Kafka: reserve.stock consumer).
     * Stok yeterliyse düşer ve 'stock.reserved' event'ini tetikler.
     * Yetersizse 'stock.reserve.failed' tetikler (Saga compensation).
     * Idempotent: Aynı eventId ile tekrar çağrılırsa işlem atlanır.
     *
     * @param eventId Kafka mesajından gelen benzersiz event kimliği (idempotency için)
     * @param payload Sipariş ID, ürün ID ve rezerve edilecek miktarı içerir
     */
    void reserveStock(UUID eventId, ReserveStockPayload payload);

    /**
     * Ürünün stok miktarını direkt olarak verilen değere ayarlar.
     *
     * @param productId Güncellenecek ürünün ID'si
     * @param quantity  Yeni stok miktarı
     * @return Güncel stok bilgisi
     */
    InventoryResponse setStock(UUID productId, int quantity);
}
