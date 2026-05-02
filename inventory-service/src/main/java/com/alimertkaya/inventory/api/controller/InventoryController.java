package com.alimertkaya.inventory.api.controller;

import com.alimertkaya.inventory.api.request.InventoryRequest;
import com.alimertkaya.inventory.api.response.InventoryResponse;
import com.alimertkaya.inventory.application.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventories")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.OK)
    public InventoryResponse addStock(@Valid @RequestBody InventoryRequest request) {
        return inventoryService.addStock(request);
    }

    @PutMapping("/{productId}")
    @ResponseStatus(HttpStatus.OK)
    public InventoryResponse setStock(@PathVariable UUID productId,
                                      @RequestParam int quantity) {
        return inventoryService.setStock(productId, quantity);
    }

    @GetMapping
    public List<InventoryResponse> getAllInventories() {
        return inventoryService.getAllInventories();
    }

    @GetMapping("/low-stock")
    public List<InventoryResponse> getLowStockInventories(
            @RequestParam(defaultValue = "10") int threshold) {
        return inventoryService.getLowStockInventories(threshold);
    }

    @GetMapping("/{productId}")
    @ResponseStatus(HttpStatus.OK)
    public InventoryResponse getStockByProductId(@PathVariable UUID productId) {
        return inventoryService.getStockByProductId(productId);
    }
}
