package com.luxurydecor.order_service.controller;

import com.luxurydecor.order_service.dto.request.PlaceOrderRequest;
import com.luxurydecor.order_service.dto.response.OrderResponse;
import com.luxurydecor.order_service.dto.response.OrderStatsResponse;
import com.luxurydecor.order_service.dto.response.PageResponse;
import com.luxurydecor.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    private Integer getCurrentUserId() {
        return (Integer) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // Đặt hàng
    @PostMapping("/place")
    public ResponseEntity<OrderResponse> placeOrder(@RequestBody PlaceOrderRequest request) {
        Integer userId = getCurrentUserId();
        return ResponseEntity.ok(orderService.placeOrder(userId, request));
    }

    // Xem lịch sử đơn hàng
    @GetMapping("/history")
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        Integer userId = getCurrentUserId();
        return ResponseEntity.ok(orderService.getMyOrders(userId));
    }

    // Chi tiết order
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable String orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    // Hủy đơn từ user
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable String orderId) {
        Integer userId = getCurrentUserId();
        return ResponseEntity.ok(orderService.cancelOrder(userId, orderId));
    }

    // ========== ADMIN ==========
    // Lấy danh sách toàn bộ đơn hàng
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')") // Uncomment khi tích hợp Security Gateway
    public ResponseEntity<PageResponse<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(orderService.getAllOrders(page, size, keyword));
    }

    // Cập nhật trạng thái đơn hàng
    // URL: PUT /api/orders/admin/OD123456/status?status=CONFIRMED
    @PutMapping("/admin/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderStatsResponse> getStats() {
        return ResponseEntity.ok(orderService.getOrderStats());
    }

    @GetMapping("/revenue-chart")
    public ResponseEntity<List<Map<String, Object>>> getRevenueChart(
            @RequestParam(defaultValue = "2026") int year // Mặc định năm hiện tại
    ) {
        return ResponseEntity.ok(orderService.getMonthlyRevenue(year));
    }

}
