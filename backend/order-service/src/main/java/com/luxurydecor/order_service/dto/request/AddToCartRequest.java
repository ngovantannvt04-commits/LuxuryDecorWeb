package com.luxurydecor.order_service.dto.request;

import lombok.Data;

@Data
public class AddToCartRequest {
    private Integer productId;
    private Integer quantity;
}
