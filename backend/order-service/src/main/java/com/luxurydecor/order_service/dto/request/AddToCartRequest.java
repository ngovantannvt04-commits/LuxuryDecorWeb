package com.luxurydecor.order_service.dto.request;

import lombok.Data;

@Data
public class AddToCartRequest {
    private Integer userId;   // Tạm thời gửi userId từ client (sau này lấy từ Token)
    private Integer productId;
    private Integer quantity;
}
