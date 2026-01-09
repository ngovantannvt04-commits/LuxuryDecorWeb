package com.luxurydecor.order_service.service;

import com.luxurydecor.order_service.client.ProductClient;
import com.luxurydecor.order_service.dto.request.PlaceOrderRequest;
import com.luxurydecor.order_service.dto.response.ExternalProductResponse;
import com.luxurydecor.order_service.dto.response.OrderDetailResponse;
import com.luxurydecor.order_service.dto.response.OrderResponse;
import com.luxurydecor.order_service.entity.Cart;
import com.luxurydecor.order_service.entity.CartItem;
import com.luxurydecor.order_service.entity.Order;
import com.luxurydecor.order_service.entity.OrderDetail;
import com.luxurydecor.order_service.enums.OrderStatus;
import com.luxurydecor.order_service.repository.CartRepository;
import com.luxurydecor.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductClient productClient;

    // === CHECKOUT ===
    @Transactional
    public OrderResponse placeOrder(PlaceOrderRequest request) {
        // Lấy giỏ hàng
        Cart cart = cartRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Giỏ hàng trống, không thể đặt hàng"));

        if (cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Giỏ hàng không có sản phẩm nào");
        }

        // Tạo Order Entity
        Order order = Order.builder()
                .userId(request.getUserId())
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .note(request.getNote())
                .paymentMethod(request.getPaymentMethod())
                .status(OrderStatus.PENDING)
                .paymentStatus("UNPAID")
                .shippingMethod("STANDARD")
                .orderDetails(new ArrayList<>())
                .build();

        // Chuyển CartItem sang OrderDetail
        double totalMoney = 0;

        for (CartItem item : cart.getCartItems()) {
            // Gọi product-service
            // Nếu sản phẩm không tồn tại, Feign sẽ ném lỗi 404 (cần try-catch nếu muốn handle mượt hơn)
            ExternalProductResponse product = productClient.getProductById(item.getProductId());

            // Validate tồn kho (Optional: Nếu muốn check)
            // if (product.getQuantity() < item.getQuantity()) throw...

            double itemTotal = product.getPrice() * item.getQuantity();

            OrderDetail detail = OrderDetail.builder()
                    .order(order)
                    .productId(item.getProductId())
                    .quantity(item.getQuantity())
                    .price(product.getPrice()) // Lưu giá tại thời điểm mua
                    .totalPrice(itemTotal)
                    .thumbnail(product.getImage())
                    .build();

            order.getOrderDetails().add(detail);
            totalMoney += itemTotal;
        }

        order.setTotalMoney(totalMoney);

        // Lưu Order
        Order savedOrder = orderRepository.save(order);

        // *Xóa sạch giỏ hàng sau khi đặt thành công*
        cart.getCartItems().clear();
        cartRepository.save(cart);

        return mapToOrderResponse(savedOrder);
    }

    // === XEM LỊCH SỬ ĐƠN HÀNG ===
    public List<OrderResponse> getMyOrders(Integer userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);
        return orders.stream().map(this::mapToOrderResponse).collect(Collectors.toList());
    }

    // === HELPER: MAPPER ===
    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderDetailResponse> details = order.getOrderDetails().stream()
                .map(d -> OrderDetailResponse.builder()
                        .productId(d.getProductId())
                        .productName(productClient.getProductById(d.getProductId()).getProductName()) // Tạm thời chưa có tên
                        .quantity(d.getQuantity())
                        .price(d.getPrice())
                        .totalPrice(d.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .fullName(order.getFullName())
                .phoneNumber(order.getPhoneNumber())
                .address(order.getAddress())
                .status(order.getStatus().name())
                .totalMoney(order.getTotalMoney())
                .orderDate(order.getOrderDate())
                .orderDetails(details)
                .build();
    }
}

