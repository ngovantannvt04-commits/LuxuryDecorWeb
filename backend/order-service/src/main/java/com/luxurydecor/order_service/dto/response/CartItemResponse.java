package com.luxurydecor.order_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CartItemResponse {
    private Integer cartItemId;
    private Integer productId;
    private Integer quantity;
    private String productName;
    private Double productPrice;
    private String productImage;
    private Integer stockQuantity;
}
