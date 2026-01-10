package com.luxurydecor.order_service.service;

import com.luxurydecor.order_service.client.ProductClient;
import com.luxurydecor.order_service.dto.request.PlaceOrderRequest;
import com.luxurydecor.order_service.dto.response.ExternalProductResponse;
import com.luxurydecor.order_service.dto.response.OrderDetailResponse;
import com.luxurydecor.order_service.dto.response.OrderResponse;
import com.luxurydecor.order_service.dto.response.PageResponse;
import com.luxurydecor.order_service.entity.Cart;
import com.luxurydecor.order_service.entity.CartItem;
import com.luxurydecor.order_service.entity.Order;
import com.luxurydecor.order_service.entity.OrderDetail;
import com.luxurydecor.order_service.enums.OrderStatus;
import com.luxurydecor.order_service.repository.CartRepository;
import com.luxurydecor.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    public OrderResponse placeOrder(Integer userId, PlaceOrderRequest request) {
        // Lấy giỏ hàng
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Giỏ hàng trống, không thể đặt hàng"));

        if (cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Giỏ hàng không có sản phẩm nào");
        }

        // Tạo Order Entity
        Order order = Order.builder()
                .userId(userId)
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

    // === CHI TIẾT ĐƠN HÀNG ===
    public OrderResponse getOrderById(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + orderId));

        return mapToOrderResponse(order);
    }

    // === LẤY TẤT CẢ ĐƠN HÀNG ===
    public PageResponse<OrderResponse> getAllOrders(int page, int size, String keyword) {
        // Sắp xếp đơn mới nhất lên đầu
        Pageable pageable = PageRequest.of(page, size, Sort.by("orderDate").descending());

        Page<Order> orderPage = orderRepository.findAllByKeyword(keyword, pageable);

        // Convert Page<Order> sang List<OrderResponse>
        List<OrderResponse> responseList = orderPage.getContent().stream()
                .map(this::mapToOrderResponse) // Tái sử dụng hàm map cũ
                .collect(Collectors.toList());

        return PageResponse.<OrderResponse>builder()
                .content(responseList)
                .page(page)
                .size(size)
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .build();
    }

    // === CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG ===
    @Transactional
    public OrderResponse updateOrderStatus(String orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));

        try {
            // Chuyển String sang Enum (Validate luôn nếu sai tên status)
            OrderStatus statusEnum = OrderStatus.valueOf(newStatus.toUpperCase());
            order.setStatus(statusEnum);

            // Logic phụ: Nếu trạng thái là DELIVERED (Đã giao) -> Cập nhật PaymentStatus thành PAID
            if (statusEnum == OrderStatus.DELIVERED) {
                order.setPaymentStatus("PAID");
                order.setShippingDate(java.time.LocalDateTime.now());
            }

        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + newStatus);
        }

        return mapToOrderResponse(orderRepository.save(order));
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
                        .thumbnail(d.getThumbnail())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .fullName(order.getFullName())
                .phoneNumber(order.getPhoneNumber())
                .address(order.getAddress())
                .note(order.getNote())
                .status(order.getStatus().name())
                .totalMoney(order.getTotalMoney())
                .orderDate(order.getOrderDate())
                .orderDetails(details)
                .build();
    }
}

