package com.luxurydecor.order_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CartItemResponse {
    private Integer cartItemId;
    private Integer productId;
    private Integer quantity;
//    private String productName;
//    private String productPrice;
//    private String productImage;
    // Sau này sẽ bổ sung: productName, productPrice, thumbnail (lấy từ Product Service)
}
