package com.luxurydecor.order_service.service;

import com.luxurydecor.order_service.client.ProductClient;
import com.luxurydecor.order_service.dto.request.PlaceOrderRequest;
import com.luxurydecor.order_service.dto.request.ProductQuantityRequest;
import com.luxurydecor.order_service.dto.response.*;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

        // lọc sản phẩm cần mua
        if (request.getSelectedProductIds() == null || request.getSelectedProductIds().isEmpty()) {
            throw new RuntimeException("Vui lòng chọn sản phẩm để thanh toán");
        }
        // Lọc ra các CartItem có ID nằm trong danh sách gửi lên
        List<CartItem> itemsToBuy = cart.getCartItems().stream()
                .filter(item -> request.getSelectedProductIds().contains(item.getProductId()))
                .collect(Collectors.toList());

        if (itemsToBuy.isEmpty()) {
            throw new RuntimeException("Sản phẩm đã chọn không tồn tại trong giỏ hàng");
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
        List<ProductQuantityRequest> reduceStockRequests = new ArrayList<>();
        double totalMoney = 0;

        for (CartItem item : itemsToBuy) {
            // Gọi product-service
            // Nếu sản phẩm không tồn tại, Feign sẽ ném lỗi 404 (cần try-catch nếu muốn handle mượt hơn)
            ExternalProductResponse product = productClient.getProductById(item.getProductId());

            reduceStockRequests.add(ProductQuantityRequest.builder()
                    .productId(item.getProductId())
                    .quantity(item.getQuantity())
                    .build());

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
        productClient.reduceStock(reduceStockRequests);
        // Lưu Order
        Order savedOrder = orderRepository.save(order);

        cart.getCartItems().removeIf(item -> request.getSelectedProductIds().contains(item.getProductId()));
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

        if ("CANCELLED".equals(newStatus) && !OrderStatus.CANCELLED.equals(order.getStatus())) {

            // 1. Tạo danh sách sản phẩm cần hoàn
            List<ProductQuantityRequest> restoreRequests = order.getOrderDetails().stream()
                    .map(detail -> ProductQuantityRequest.builder()
                            .productId(detail.getProductId())
                            .quantity(detail.getQuantity())
                            .build())
                    .collect(Collectors.toList());

            // 2. Gọi Product Service để hoàn kho
            productClient.restoreStock(restoreRequests);
        }

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

    // Hủy đơn phía user
    @Transactional
    public OrderResponse cancelOrder(Integer userId, String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        // Chỉ cho phép hủy đơn của chính mình
        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này");
        }

        // Chỉ cho phép hủy khi đang PENDING (đã giao rồi thì không được hủy online)
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng khi đang chờ xử lý");
        }

        // Logic hoàn kho (Giống hệt bên trên)
        List<ProductQuantityRequest> restoreRequests = order.getOrderDetails().stream()
                .map(detail -> ProductQuantityRequest.builder()
                        .productId(detail.getProductId())
                        .quantity(detail.getQuantity())
                        .build())
                .collect(Collectors.toList());
        productClient.restoreStock(restoreRequests);

        order.setStatus(OrderStatus.CANCELLED);
        return mapToOrderResponse(orderRepository.save(order));
    }

    // Thống kê
    public OrderStatsResponse getOrderStats() {
        // Tính doanh thu: Chỉ tính đơn đã Giao thành công (DELIVERED hoặc COMPLETED)
        Double revenue = orderRepository.sumRevenueByStatus(OrderStatus.DELIVERED);

        // Đếm các loại đơn
        long total = orderRepository.count();
        long pending = orderRepository.countByStatus(OrderStatus.PENDING);
        long shipping = orderRepository.countByStatus(OrderStatus.SHIPPING);
        long delivered = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long cancelled = orderRepository.countByStatus(OrderStatus.CANCELLED);

        // Đóng gói vào DTO
        return OrderStatsResponse.builder()
                .totalRevenue(revenue)
                .totalOrders(total)
                .pendingOrders(pending)
                .shippingOrders(shipping)
                .successOrders(delivered)
                .cancelledOrders(cancelled)
                .build();
    }

    public List<Map<String, Object>> getMonthlyRevenue(int year) {
        List<Object[]> results = orderRepository.sumRevenueByYear(year);

        // 1. Tạo map tạm để lưu doanh thu từng tháng tìm được
        Map<Integer, Double> revenueMap = new HashMap<>();
        for (Object[] row : results) {
            Integer month = (Integer) row[0];
            Double revenue = (Double) row[1];
            revenueMap.put(month, revenue);
        }

        // 2. Tạo danh sách đủ 12 tháng (Tháng nào không có thì set = 0)
        List<Map<String, Object>> finalData = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            Map<String, Object> item = new HashMap<>();
            item.put("month", "Tháng " + i); // Label cho biểu đồ
            item.put("revenue", revenueMap.getOrDefault(i, 0.0)); // Value
            finalData.add(item);
        }

        return finalData;
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
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .orderDate(order.getOrderDate())
                .orderDetails(details)
                .build();
    }
}

