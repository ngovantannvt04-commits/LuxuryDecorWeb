package com.luxurydecor.product_service.service;

import com.luxurydecor.product_service.dto.CategoryRequest;
import com.luxurydecor.product_service.dto.ProductRequest;
import com.luxurydecor.product_service.dto.ProductResponse;
import com.luxurydecor.product_service.entity.Category;
import com.luxurydecor.product_service.entity.Product;
import com.luxurydecor.product_service.repository.CategoryRepository;
import com.luxurydecor.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // --- CATEGORY ---
    public Category createCategory(CategoryRequest request) {
        if (categoryRepository.existsByCategoryName(request.getCategoryName())) {
            throw new RuntimeException("Danh mục đã tồn tại");
        }
        Category category = Category.builder()
                .categoryName(request.getCategoryName())
                .build();
        return categoryRepository.save(category);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // Hàm sinh ID ngẫu nhiên không trùng lặp
    private Integer generateUniqueProductId() {
        int randomId;
        do {
            randomId = new Random().nextInt(900000) + 100000;
        } while (productRepository.existsById(randomId)); // Check xem trùng không

        return randomId;
    }

    // --- PRODUCT ---
    public ProductResponse getProductById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        return mapToProductResponse(product);
    }

    public ProductResponse createProduct(ProductRequest request) {
        // 1. Tìm danh mục trước
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));

        // 2. Tạo sản phẩm
        Product product = Product.builder()
                .productId(generateUniqueProductId())
                .productName(request.getProductName())
                .price(request.getPrice())
                .image(request.getImage())
                .description(request.getDescription())
                .stockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0)
                .quantitySold(request.getQuantitySold() != null ? request.getQuantitySold() : 0)
                .category(category)
                .createdAt(LocalDateTime.now())
                .isNew(true)
                .build();

        productRepository.save(product);

        return mapToProductResponse(product);
    }

    public Page<ProductResponse> getAllProducts(int page, int size, String sortBy) {
        // Tạo Pageable (Trang bắt đầu từ 0, sắp xếp theo ngày tạo mới nhất)
        Pageable pageable = PageRequest.of(page, size, createSort(sortBy));

        Page<Product> productPage = productRepository.findAll(pageable);

        // Convert Page<Entity> sang Page<DTO>
        return productPage.map(this::mapToProductResponse);
    }

    // === 2. CẬP NHẬT SẢN PHẨM (UPDATE) ===
    public ProductResponse updateProduct(Integer productId, ProductRequest request) {
        // Tìm sản phẩm
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + productId));

        if (!product.getCategory().getCategoryId().equals(request.getCategoryId())) {
            Category newCategory = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Danh mục mới không tồn tại"));
            product.setCategory(newCategory);
        }

        // Cập nhật thông tin
        product.setProductName(request.getProductName());
        product.setPrice(request.getPrice());
        product.setDescription(request.getDescription());
        product.setImage(request.getImage());

        // Cập nhật Stock
        if (request.getStockQuantity() != null) {
            product.setStockQuantity(request.getStockQuantity());
        }

        if (request.getQuantitySold() != null) {
            product.setQuantitySold(request.getQuantitySold());
        }

        // Lưu lại
        Product updatedProduct = productRepository.save(product);
        return mapToProductResponse(updatedProduct);
    }

    // === 3. XÓA SẢN PHẨM (DELETE) ===
    public void deleteProduct(Integer productId) {
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Không tìm thấy sản phẩm để xóa");
        }
        productRepository.deleteById(productId);
    }

    public Page<ProductResponse> getProductsByCategory(Integer categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Product> productPage = productRepository.findByCategory_CategoryId(categoryId, pageable);

        return productPage.map(this::mapToProductResponse);
    }

    // SEARCH
    public Page<ProductResponse> searchProducts(String keyword, int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, createSort(sortBy));
        return productRepository.findByProductNameContainingIgnoreCase(keyword, pageable)
                .map(this::mapToProductResponse);
    }

    // BỘ LỌC
    public Page<ProductResponse> filterProducts(Long minPrice, Long maxPrice, Integer categoryId, int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, createSort(sortBy));

        return productRepository.filterProducts(minPrice, maxPrice, categoryId, pageable)
                .map(this::mapToProductResponse);
    }

    private Sort createSort(String sortBy) {
        Sort sort = Sort.by("createdAt").descending(); // Mặc định
        if (sortBy != null) {
            switch (sortBy) {
                case "price_asc":
                    sort = Sort.by("price").ascending();
                    break;
                case "price_desc":
                    sort = Sort.by("price").descending();
                    break;
                default:
                    sort = Sort.by("createdAt").descending();
                    break;
            }
        }
        return sort;
    }

    public List<ProductResponse> getFeaturedProducts() {
        List<Product> products = productRepository.findOneProductPerCategory();
        return products.stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    // Helper convert Entity -> DTO
    private ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .price(product.getPrice())
                .image(product.getImage())
                .description(product.getDescription())
                .stockQuantity(product.getStockQuantity())
                .quantitySold(product.getQuantitySold())
                .categoryName(product.getCategory().getCategoryName())
                .categoryId(product.getCategory().getCategoryId())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
