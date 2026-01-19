package com.luxurydecor.product_service.repository;

import com.luxurydecor.product_service.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    Page<Product> findByCategory_CategoryId(Integer categoryId, Pageable pageable);

    Page<Product> findByProductNameContainingIgnoreCase(String keyword, Pageable pageable);

    // Lọc theo Giá và Danh mục
    // Logic: Nếu tham số nào null thì bỏ qua điều kiện đó (Dùng JPQL)
    @Query("SELECT p FROM Product p WHERE " +
            "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
            "(:categoryId IS NULL OR p.category.categoryId = :categoryId)")
    Page<Product> filterProducts(
            @Param("minPrice") Long minPrice,
            @Param("maxPrice") Long maxPrice,
            @Param("categoryId") Integer categoryId,
            Pageable pageable
    );

    @Query(value = "SELECT DISTINCT ON (p.category_id) p.* " +
            "FROM product_schema.products p " +
            "ORDER BY p.category_id, p.created_at DESC",
            nativeQuery = true)
    List<Product> findOneProductPerCategory();

    long countByStockQuantityLessThan(int quantity);
}
