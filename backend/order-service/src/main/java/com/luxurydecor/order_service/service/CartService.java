package com.luxurydecor.order_service.service;

import com.luxurydecor.order_service.client.ProductClient;
import com.luxurydecor.order_service.dto.request.AddToCartRequest;
import com.luxurydecor.order_service.dto.response.CartItemResponse;
import com.luxurydecor.order_service.dto.response.CartResponse;
import com.luxurydecor.order_service.dto.response.ExternalProductResponse;
import com.luxurydecor.order_service.entity.Cart;
import com.luxurydecor.order_service.entity.CartItem;
import com.luxurydecor.order_service.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;
    private final ProductClient productClient;

    // === 1. THÊM VÀO GIỎ HÀNG ===
    @Transactional
    public CartResponse addToCart(Integer userId, AddToCartRequest request) {
        // B1: Tìm giỏ hàng của user, nếu chưa có thì tạo mới
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .userId(userId)
                            .cartItems(new ArrayList<>())
                            .build();
                    return cartRepository.save(newCart);
                });

        // B2: Kiểm tra xem sản phẩm đã có trong giỏ chưa
        Optional<CartItem> existingItem = cart.getCartItems().stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            // Trường hợp 1: Đã có -> Cộng dồn số lượng
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
        } else {
            // Trường hợp 2: Chưa có -> Tạo mới item
            CartItem newItem = CartItem.builder()
                    .cart(cart) // Set quan hệ cha
                    .productId(request.getProductId())
                    .quantity(request.getQuantity())
                    .build();
            cart.getCartItems().add(newItem);
        }

        // B3: Lưu lại (Cascade sẽ tự lưu CartItems)
        Cart savedCart = cartRepository.save(cart);

        return mapToCartResponse(savedCart);
    }

    // === 2. LẤY GIỎ HÀNG ===
    public CartResponse getCartByUserId(Integer userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Giỏ hàng trống"));
        return mapToCartResponse(cart);
    }

    // === 3. XÓA SẢN PHẨM KHỎI GIỎ ===
    @Transactional
    public CartResponse removeFromCart(Integer userId, Integer productId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        // Xóa item có productId tương ứng
        cart.getCartItems().removeIf(item -> item.getProductId().equals(productId));

        return mapToCartResponse(cartRepository.save(cart));
    }

    // Helper: Map Entity sang DTO Response
    private CartResponse mapToCartResponse(Cart cart) {
        // Tính tổng số lượng item
        int totalItems = cart.getCartItems().stream().mapToInt(CartItem::getQuantity).sum();

        List<CartItemResponse> items = cart.getCartItems().stream()
                .map(item -> {
                    // call product-service to get infor
                    ExternalProductResponse product = null;
                    try {
                        // Gọi Feign Client
                        product = productClient.getProductById(item.getProductId());
                    } catch (Exception e) {
                        product = new ExternalProductResponse();
                        product.setProductName("Sản phẩm lỗi hoặc không tồn tại");
                        product.setPrice(0.0);
                        product.setStockQuantity(0);
                    }

                    return CartItemResponse.builder()
                            .cartItemId(item.getCartItemId())
                            .productId(item.getProductId())
                            .quantity(item.getQuantity())
                            .productName(product.getProductName())
                            .productPrice(product.getPrice())
                            .productImage(product.getImage())
                            .stockQuantity(product.getStockQuantity())
                            .build();
                })
                .collect(Collectors.toList());

        return CartResponse.builder()
                .cartId(cart.getCartId())
                .userId(cart.getUserId())
                .totalItems(totalItems)
                .items(items)
                .build();
    }
}
