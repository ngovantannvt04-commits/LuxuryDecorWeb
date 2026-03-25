package com.luxurydecor.product_service.repository;

import com.luxurydecor.product_service.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findAll();

    // Tìm tất cả đánh giá của 1 sản phẩm
    List<Review> findByProduct_ProductIdOrderByCreatedAtDesc(Integer productId);

    // Lấy reviews của một user cụ thể
    List<Review> findByAccountId(Integer accountId);
}
