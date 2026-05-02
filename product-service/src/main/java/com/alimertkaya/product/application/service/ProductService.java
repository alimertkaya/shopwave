package com.alimertkaya.product.application.service;

import com.alimertkaya.product.api.request.ProductRequest;
import com.alimertkaya.product.api.response.ProductResponse;

import java.util.List;
import java.util.UUID;

public interface ProductService {

    /**
     * Yeni bir ürün oluşturur ve veritabanına kaydeder.
     *
     * @param request Ürün adı, açıklaması, fiyatı ve kategorisini içeren istek
     * @return Oluşturulan ürünün bilgilerini içeren yanıt
     */
    ProductResponse createProduct(ProductRequest request);

    /**
     * Sistemdeki tüm ürünleri listeler.
     *
     * @return Tüm ürünlerin listesi; boş olabilir
     */
    List<ProductResponse> getAllProducts();

    /**
     * Belirtilen ID'ye sahip ürünü döndürür.
     *
     * @param id Aranan ürünün benzersiz kimliği
     * @return Bulunan ürünün bilgileri
     * @throws com.alimertkaya.product.domain.exception.EntityNotFoundException Ürün bulunamazsa
     */
    ProductResponse getProductById(UUID id);

    /**
     * Mevcut bir ürünü günceller.
     *
     * @param id      Güncellenecek ürünün ID'si
     * @param request Yeni ürün bilgileri
     * @return Güncellenmiş ürün bilgileri
     */
    ProductResponse updateProduct(UUID id, ProductRequest request);

    /**
     * Belirtilen ürünü siler.
     *
     * @param id Silinecek ürünün ID'si
     */
    void deleteProduct(UUID id);
}