package com.luxurydecor.product_service.dto;

import lombok.Data;

@Data
public class ProductQuantityRequest {
    private Integer productId;
    private Integer quantity;
}
