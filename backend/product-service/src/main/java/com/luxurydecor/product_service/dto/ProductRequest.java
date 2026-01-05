package com.luxurydecor.product_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductRequest {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String productName;

    @NotNull(message = "Giá không được để trống")
    @Min(value = 0, message = "Giá phải lớn hơn 0")
    private Long price;

    private String image;
    private String description;

    @Min(value = 0, message = "Số lượng tồn kho phải lớn hơn 0")
    private Integer stockQuantity;
    @Min(value = 0, message = "Số lượng bán không được âm")
    private Integer quantitySold;

    @NotNull(message = "Phải chọn danh mục cho sản phẩm")
    private Integer categoryId;
}
