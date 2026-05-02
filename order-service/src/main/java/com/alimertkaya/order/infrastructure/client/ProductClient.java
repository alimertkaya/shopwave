package com.alimertkaya.order.infrastructure.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

import java.util.Optional;
import java.util.UUID;

@FeignClient(name = "product-service", url = "${PRODUCT_SERVICE_URL:http://localhost:8082}")
public interface ProductClient {

    @GetMapping("/api/products/{id}")
    @CircuitBreaker(name = "productServiceCircuitBreaker", fallbackMethod = "productServiceFallback")
    @Retry(name = "productServiceRetry")
    Optional<ProductDto> getProductById(@PathVariable("id") UUID productId);

    // product service cokerse bu calisacak
    default Optional<ProductDto> productServiceFallback(UUID productId, Throwable exception) {
        System.err.println("Product Service'e ulaşılamıyor! Circuit Open. Hata: " + exception.getMessage());
        return Optional.empty();
    }
}
