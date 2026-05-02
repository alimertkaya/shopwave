package com.alimertkaya.order.application.mapper;

import com.alimertkaya.order.api.request.CreateOrderRequest;
import com.alimertkaya.order.api.response.OrderResponse;
import com.alimertkaya.order.domain.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "totalPrice", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "userId", expression = "java(request.userId().toString())")
    Order toEntity(CreateOrderRequest request);

    @Mapping(target = "userId", expression = "java(java.util.UUID.fromString(entity.getUserId()))")
    OrderResponse toResponse(Order entity);
}
