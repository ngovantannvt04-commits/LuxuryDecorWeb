package com.luxurydecor.order_service.controller;

import com.luxurydecor.order_service.dto.request.AddToCartRequest;
import com.luxurydecor.order_service.dto.response.CartResponse;
import com.luxurydecor.order_service.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
public class CartController {
    @Autowired
    private CartService cartService;

    // Helper lấy ID từ Token
    private Integer getCurrentUserId() {
        return (Integer) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
    // Thêm vào giỏ
    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(@RequestBody AddToCartRequest request) {
        Integer userId = getCurrentUserId();
        return ResponseEntity.ok(cartService.addToCart(userId, request));
    }

    // Xem giỏ hàng
    @GetMapping("/my-cart")
    public ResponseEntity<CartResponse> getCart() {
        Integer userId = getCurrentUserId();
        return ResponseEntity.ok(cartService.getCartByUserId(userId));
    }

    // Xóa sản phẩm khỏi giỏ
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<CartResponse> removeFromCart(
            @PathVariable Integer productId) {
        Integer userId = getCurrentUserId();
        return ResponseEntity.ok(cartService.removeFromCart(userId, productId));
    }
}
