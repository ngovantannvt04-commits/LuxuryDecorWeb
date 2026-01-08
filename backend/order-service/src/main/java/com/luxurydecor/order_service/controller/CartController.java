package com.luxurydecor.order_service.controller;

import com.luxurydecor.order_service.dto.request.AddToCartRequest;
import com.luxurydecor.order_service.dto.response.CartResponse;
import com.luxurydecor.order_service.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
public class CartController {
    @Autowired
    private CartService cartService;

    // Thêm vào giở
    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(@RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(cartService.addToCart(request));
    }

    // Xem giỏ hàng
    @GetMapping("/{userId}")
    public ResponseEntity<CartResponse> getCart(@PathVariable Integer userId) {
        return ResponseEntity.ok(cartService.getCartByUserId(userId));
    }

    // Xóa sản phẩm khỏi giỏ
    @DeleteMapping("/{userId}/remove/{productId}")
    public ResponseEntity<CartResponse> removeFromCart(
            @PathVariable Integer userId,
            @PathVariable Integer productId
    ) {
        return ResponseEntity.ok(cartService.removeFromCart(userId, productId));
    }
}
