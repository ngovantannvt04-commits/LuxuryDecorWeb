package com.luxurydecor.product_service.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.luxurydecor.product_service.dto.*;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final Cloudinary cloudinary;

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

    public String uploadProductImage(MultipartFile file) throws IOException {
        // Tạo folder riêng cho sản phẩm cho gọn
        Map params = ObjectUtils.asMap(
                "folder", "product_images",
                "resource_type", "image"
        );
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
        return (String) uploadResult.get("secure_url");
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

    // Xử lý kho và bán
    @Transactional
    public void reduceStock(List<ProductQuantityRequest> requests) {
        for (ProductQuantityRequest request : requests) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + request.getProductId()));

            if (product.getStockQuantity() < request.getQuantity()) {
                throw new RuntimeException("Sản phẩm " + product.getProductName() + " không đủ hàng trong kho");
            }

            // Trừ tồn kho
            product.setStockQuantity(product.getStockQuantity() - request.getQuantity());

            // Tăng số lượng bán
            int currentSold = product.getQuantitySold() == null ? 0 : product.getQuantitySold();
            product.setQuantitySold(currentSold + request.getQuantity());

            productRepository.save(product);
        }
    }

    // Kho và bán khi bị hủy đơn
    @Transactional
    public void restoreStock(List<ProductQuantityRequest> requests) {
        for (ProductQuantityRequest request : requests) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + request.getProductId()));

            // Cộng lại tồn kho
            product.setStockQuantity(product.getStockQuantity() + request.getQuantity());

            // Trừ đi số lượng đã bán
            int currentSold = product.getQuantitySold() == null ? 0 : product.getQuantitySold();
            product.setQuantitySold(Math.max(0, currentSold - request.getQuantity()));

            productRepository.save(product);
        }
    }

    // Thống kê sản phẩm
    public Map<String, Object> getProductStats() {
        long totalProducts = productRepository.count();

        // Quy định logic nghiệp vụ: Dưới 10 là báo động
        int lowStockThreshold = 10;
        long lowStockProducts = productRepository.countByStockQuantityLessThan(lowStockThreshold);

        List<Product> lowStockList = productRepository.findByStockQuantityLessThanOrderByStockQuantityAsc(lowStockThreshold);
        List<Map<String, Object>> lowStockDetails = lowStockList.stream()
                .limit(5)
                .map(p -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("productId", p.getProductId());
                    item.put("productName", p.getProductName());
                    item.put("image", p.getImage());
                    item.put("stockQuantity", p.getStockQuantity());
                    return item;
                })
                .collect(Collectors.toList());

        List<Product> highStockList = productRepository.findTop5ByOrderByStockQuantityDesc();
        List<Map<String, Object>> highStockDetails = highStockList.stream()
                .map(p -> {
                    Map<String, Object> itemz = new HashMap<>();
                    itemz.put("productId", p.getProductId());
                    itemz.put("productName", p.getProductName());
                    itemz.put("image", p.getImage());
                    itemz.put("stockQuantity", p.getStockQuantity());
                    return itemz;
                })
                .collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("total_products", totalProducts);
        stats.put("low_stock_products", lowStockProducts);
        stats.put("low_stock_list", lowStockDetails);
        stats.put("high_stock_list", highStockDetails);

        return stats;
    }

    public PageResponse<ProductResponse> getLowStockProducts(int page, int size) {
        int lowStockThreshold = 10; // Ngưỡng báo động
        Pageable pageable = PageRequest.of(page, size);

        Page<Product> productPage = productRepository.findByStockQuantityLessThanOrderByStockQuantityAsc(lowStockThreshold, pageable);

        // Map Entity sang DTO (ProductResponse)
        List<ProductResponse> productResponses = productPage.getContent().stream()
                .map(this::mapToProductResponse) // Giả sử bạn đã có hàm map này
                .collect(Collectors.toList());

        return PageResponse.<ProductResponse>builder()
                .content(productResponses)
                .page(productPage.getNumber() + 1) // Frontend thường đếm từ 1
                .size(productPage.getSize())
                .totalPages(productPage.getTotalPages())
                .totalElements(productPage.getTotalElements())
                .build();
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
