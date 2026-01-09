package com.luxurydecor.order_service.controller;

import com.luxurydecor.order_service.dto.request.PlaceOrderRequest;
import com.luxurydecor.order_service.dto.response.OrderResponse;
import com.luxurydecor.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    // Đặt hàng
    @PostMapping("/place")
    public ResponseEntity<OrderResponse> placeOrder(@RequestBody PlaceOrderRequest request) {
        return ResponseEntity.ok(orderService.placeOrder(request));
    }

    // Xem lịch sử đơn hàng
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@PathVariable Integer userId) {
        return ResponseEntity.ok(orderService.getMyOrders(userId));
    }
}
