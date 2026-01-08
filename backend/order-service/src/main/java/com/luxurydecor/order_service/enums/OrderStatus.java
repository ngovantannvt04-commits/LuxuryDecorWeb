package com.luxurydecor.order_service.enums;

public enum OrderStatus {
    PENDING,    // Chờ xử lý
    CONFIRMED,  // Đã xác nhận
    SHIPPING,   // Đang giao
    DELIVERED,  // Đã giao
    CANCELLED   // Đã hủy
}
