package com.luxurydecor.order_service.client;

import com.luxurydecor.order_service.dto.response.ExternalProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-service", url = "http://localhost:8082/api/products")
public interface ProductClient {
    @GetMapping("/{id}")
    ExternalProductResponse getProductById(@PathVariable("id") Integer id);
}
