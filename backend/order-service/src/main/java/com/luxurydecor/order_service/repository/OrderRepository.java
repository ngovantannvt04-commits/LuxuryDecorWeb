package com.luxurydecor.order_service.repository;

import com.luxurydecor.order_service.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order,String> {
    List<Order> findByUserIdOrderByOrderDateDesc(Integer userId);
    // Tìm kiếm theo Mã đơn hoặc SĐT + Phân trang)
    @Query("SELECT o FROM Order o WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "lower(o.orderId) LIKE lower(concat('%', :keyword, '%')) OR " +
            "o.phoneNumber LIKE %:keyword%)")
    Page<Order> findAllByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
