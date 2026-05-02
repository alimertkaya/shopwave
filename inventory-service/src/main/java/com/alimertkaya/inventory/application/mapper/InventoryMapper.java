package com.alimertkaya.inventory.application.mapper;

import com.alimertkaya.inventory.api.request.InventoryRequest;
import com.alimertkaya.inventory.api.response.InventoryResponse;
import com.alimertkaya.inventory.domain.entity.Inventory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryMapper {

    @Mapping(target = "id", ignore = true)
    Inventory toEntity(InventoryRequest request);

    InventoryResponse toResponse(Inventory entity);
}
