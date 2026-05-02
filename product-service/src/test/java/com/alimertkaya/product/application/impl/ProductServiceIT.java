package com.alimertkaya.product.application.impl;

import com.alimertkaya.product.api.request.ProductRequest;
import com.alimertkaya.product.api.response.ProductResponse;
import com.alimertkaya.product.application.service.ProductService;
import com.alimertkaya.product.domain.exception.EntityNotFoundException;
import com.alimertkaya.product.infrastructure.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * ProductServiceImpl için Testcontainers tabanlı integration testleri.
 * Gerçek PostgreSQL container kullanır; her test @Transactional ile otomatik geri alınır.
 */
@SpringBootTest
@ActiveProfiles("test")
@Testcontainers
@Transactional
class ProductServiceIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");

    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void configureDataSource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379).toString());
    }

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    // ─── createProduct ───────────────────────────────────────────────────────────

    @Test
    void createProduct_whenValidRequest_thenProductPersistedToDatabase() {
        // given
        ProductRequest request = new ProductRequest("Gaming Laptop", "High-end gaming laptop", new BigDecimal("25000.00"), "Electronics", null);

        // when
        ProductResponse response = productService.createProduct(request);

        // then
        assertThat(response.id()).isNotNull();
        assertThat(response.name()).isEqualTo("Gaming Laptop");
        assertThat(response.price()).isEqualByComparingTo(new BigDecimal("25000.00"));
        assertThat(productRepository.existsById(response.id())).isTrue();
    }

    // ─── getAllProducts ───────────────────────────────────────────────────────────

    @Test
    void getAllProducts_whenMultipleProductsExist_thenAllReturned() {
        // given
        productService.createProduct(new ProductRequest("Product A", "Desc A", new BigDecimal("100.00"), "Cat A", null));
        productService.createProduct(new ProductRequest("Product B", "Desc B", new BigDecimal("200.00"), "Cat B", null));

        // when
        List<ProductResponse> products = productService.getAllProducts();

        // then
        assertThat(products).hasSizeGreaterThanOrEqualTo(2);
        assertThat(products).extracting(ProductResponse::name).contains("Product A", "Product B");
    }

    @Test
    void getAllProducts_whenNoProductsExist_thenEmptyListReturned() {
        // when
        List<ProductResponse> products = productService.getAllProducts();

        // then
        assertThat(products).isEmpty();
    }

    // ─── getProductById ──────────────────────────────────────────────────────────

    @Test
    void getProductById_whenProductExists_thenCorrectProductReturned() {
        // given
        ProductResponse created = productService.createProduct(
                new ProductRequest("Smart Watch", "Fitness tracker", new BigDecimal("3500.00"), "Accessories", null));

        // when
        ProductResponse found = productService.getProductById(created.id());

        // then
        assertThat(found.id()).isEqualTo(created.id());
        assertThat(found.name()).isEqualTo("Smart Watch");
        assertThat(found.category()).isEqualTo("Accessories");
    }

    @Test
    void getProductById_whenProductNotFound_thenEntityNotFoundExceptionThrown() {
        // when / then
        assertThatThrownBy(() -> productService.getProductById(UUID.randomUUID()))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
