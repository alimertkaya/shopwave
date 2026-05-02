package com.alimertkaya.product.application.impl;

import com.alimertkaya.product.api.request.ProductRequest;
import com.alimertkaya.product.api.response.ProductResponse;
import com.alimertkaya.product.application.mapper.ProductMapper;
import com.alimertkaya.product.domain.entity.Product;
import com.alimertkaya.product.domain.exception.EntityNotFoundException;
import com.alimertkaya.product.infrastructure.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductServiceImpl productService;

    private UUID productId;
    private Product mockProduct;
    private ProductResponse mockResponse;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        mockProduct = new Product();
        mockResponse = new ProductResponse(productId, "Laptop", "Test açıklama", new BigDecimal("15000.00"), "Elektronik", null);
    }

    // ─── createProduct ────────────────────────────────────────────────────────────

    @Test
    void createProduct_whenValidRequest_thenProductSavedAndReturned() {
        // given
        ProductRequest request = new ProductRequest("Laptop", "Test açıklama", new BigDecimal("15000.00"), "Elektronik", null);
        when(productMapper.toEntity(request)).thenReturn(mockProduct);
        when(productRepository.save(mockProduct)).thenReturn(mockProduct);
        when(productMapper.toResponse(mockProduct)).thenReturn(mockResponse);

        // when
        ProductResponse result = productService.createProduct(request);

        // then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Laptop");
        assertThat(result.price()).isEqualByComparingTo("15000.00");
        verify(productRepository, times(1)).save(mockProduct);
    }

    // ─── getAllProducts ────────────────────────────────────────────────────────────

    @Test
    void getAllProducts_whenProductsExist_thenReturnList() {
        // given
        when(productRepository.findAll()).thenReturn(List.of(mockProduct, mockProduct));
        when(productMapper.toResponse(any(Product.class))).thenReturn(mockResponse);

        // when
        List<ProductResponse> results = productService.getAllProducts();

        // then
        assertThat(results).hasSize(2);
        verify(productRepository, times(1)).findAll();
    }

    @Test
    void getAllProducts_whenNoProducts_thenReturnEmptyList() {
        // given
        when(productRepository.findAll()).thenReturn(List.of());

        // when
        List<ProductResponse> results = productService.getAllProducts();

        // then
        assertThat(results).isEmpty();
    }

    // ─── getProductById ───────────────────────────────────────────────────────────

    @Test
    void getProductById_whenProductExists_thenReturnProduct() {
        // given
        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));
        when(productMapper.toResponse(mockProduct)).thenReturn(mockResponse);

        // when
        ProductResponse result = productService.getProductById(productId);

        // then
        assertThat(result.id()).isEqualTo(productId);
        assertThat(result.name()).isEqualTo("Laptop");
    }

    @Test
    void getProductById_whenProductNotFound_thenThrowsEntityNotFoundException() {
        // given
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        // when / then
        assertThatThrownBy(() -> productService.getProductById(productId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining(productId.toString());
    }
}
