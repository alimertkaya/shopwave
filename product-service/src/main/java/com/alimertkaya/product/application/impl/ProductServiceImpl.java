package com.alimertkaya.product.application.impl;

import com.alimertkaya.product.api.request.ProductRequest;
import com.alimertkaya.product.api.response.ProductResponse;
import com.alimertkaya.product.application.mapper.ProductMapper;
import com.alimertkaya.product.application.service.ProductService;
import com.alimertkaya.product.domain.entity.Product;
import com.alimertkaya.product.domain.exception.EntityNotFoundException;
import com.alimertkaya.product.infrastructure.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public ProductResponse createProduct(ProductRequest request) {
        Product product = productMapper.toEntity(request);
        Product savedProduct = productRepository.save(product);
        log.info("Product created with ID: {}", savedProduct.getId());
        return productMapper.toResponse(savedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products")
    public List<ProductResponse> getAllProducts() {
        log.info("Cache miss — DB'den ürünler yükleniyor");
        return productRepository.findAll().stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "product", key = "#id")
    public ProductResponse getProductById(UUID id) {
        log.info("Cache miss — DB'den ürün yükleniyor. ID: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ürün bulunamadı. ID: " + id));
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public ProductResponse updateProduct(UUID id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ürün bulunamadı. ID: " + id));
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setCategory(request.category());
        product.setImageUrl(request.imageUrl());
        log.info("Product updated with ID: {}", id);
        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public void deleteProduct(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Ürün bulunamadı. ID: " + id);
        }
        productRepository.deleteById(id);
        log.info("Product deleted with ID: {}", id);
    }
}