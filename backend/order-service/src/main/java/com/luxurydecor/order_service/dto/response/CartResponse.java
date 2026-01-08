package com.luxurydecor.order_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CartResponse {
    private String cartId;
    private Integer userId;
    private Integer totalItems; // Tổng số lượng sản phẩm
    private List<CartItemResponse> items;
}
