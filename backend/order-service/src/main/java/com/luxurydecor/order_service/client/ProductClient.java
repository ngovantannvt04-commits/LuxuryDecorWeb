package com.luxurydecor.order_service.client;

import com.luxurydecor.order_service.dto.request.ProductQuantityRequest;
import com.luxurydecor.order_service.dto.response.ExternalProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "product-service", url = "http://localhost:8082/api/products")
public interface ProductClient {
    @GetMapping("/{id}")
    ExternalProductResponse getProductById(@PathVariable("id") Integer id);

    @PutMapping("/reduce-stock")
    void reduceStock(@RequestBody List<ProductQuantityRequest> requests);

    @PutMapping("/restore-stock")
    void restoreStock(@RequestBody List<ProductQuantityRequest> requests);
}
