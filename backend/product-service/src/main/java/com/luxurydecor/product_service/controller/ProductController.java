package com.luxurydecor.product_service.controller;

import com.luxurydecor.product_service.dto.CategoryRequest;
import com.luxurydecor.product_service.dto.ProductRequest;
import com.luxurydecor.product_service.dto.ProductResponse;
import com.luxurydecor.product_service.entity.Category;
import com.luxurydecor.product_service.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    // === CATEGORY APIs ===
    // CREATE CATEGORY
    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody @Valid CategoryRequest request) {
        return ResponseEntity.ok(productService.createCategory(request));
    }

    // READ CATEGORY
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }

    // === PRODUCT APIs ===
    // CREATE PRODUCT
    @PostMapping("/create")
    public ResponseEntity<ProductResponse> createProduct(@RequestBody @Valid ProductRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    // READ PRODUCT
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "18") int size,
            @RequestParam(defaultValue = "newest") String sortBy
    ) {
        return ResponseEntity.ok(productService.getAllProducts(page, size, sortBy));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // UPDATE PRODUCT
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Integer id,
            @RequestBody @Valid ProductRequest request
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    // DELETE PRODUCT
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Xóa sản phẩm thành công");
    }

    // READ PRODUCT BELONG TO CATEGORY
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<ProductResponse>> getProductsByCategory(
            @PathVariable Integer categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "18") int size
    ) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId, page, size));
    }

    // SEARCH
    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponse>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "18") int size,
            @RequestParam(defaultValue = "newest") String sortBy
    ) {
        return ResponseEntity.ok(productService.searchProducts(keyword, page, size, sortBy));
    }

    // FILTER
    @GetMapping("/filter")
    public ResponseEntity<Page<ProductResponse>> filterProducts(
            @RequestParam(required = false) Long minPrice,
            @RequestParam(required = false) Long maxPrice,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "18") int size,
            @RequestParam(defaultValue = "newest") String sortBy
    ) {
        return ResponseEntity.ok(productService.filterProducts(minPrice, maxPrice, categoryId, page, size, sortBy));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ProductResponse>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }
}
