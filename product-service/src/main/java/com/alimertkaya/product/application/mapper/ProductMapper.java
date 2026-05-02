package com.alimertkaya.product.application.mapper;

import com.alimertkaya.product.api.request.ProductRequest;
import com.alimertkaya.product.api.response.ProductResponse;
import com.alimertkaya.product.domain.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Product toEntity(ProductRequest request);

    ProductResponse toResponse(Product entity);
}
