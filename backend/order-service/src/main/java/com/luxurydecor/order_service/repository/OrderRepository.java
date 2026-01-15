package com.luxurydecor.order_service.repository;

import com.luxurydecor.order_service.entity.Order;
import com.luxurydecor.order_service.enums.OrderStatus;
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

    // Tính tổng tiền của các đơn có trạng thái cụ thể
    // Dùng COALESCE để nếu null thì trả về 0
    @Query("SELECT COALESCE(SUM(o.totalMoney), 0) FROM Order o WHERE o.status = :status")
    Double sumRevenueByStatus(@Param("status") OrderStatus status);

    // Đếm số đơn theo trạng thái
    long countByStatus(OrderStatus status);

    // Lấy 5 đơn mới nhất
    List<Order> findTop5ByOrderByOrderDateDesc();

    // Lấy doanh thu theo tháng trong năm cụ thể
    // EXTRACT(MONTH ...) của Postgres trả về số từ 1-12
    @Query(value = """
        SELECT CAST(EXTRACT(MONTH FROM order_date) AS INTEGER) as month, 
               SUM(total_money) as revenue 
        FROM order_schema.orders 
        WHERE status = 'DELIVERED' 
          AND CAST(EXTRACT(YEAR FROM order_date) AS INTEGER) = :year
        GROUP BY month
        ORDER BY month ASC
    """, nativeQuery = true)
    List<Object[]> sumRevenueByYear(@Param("year") int year);
}
