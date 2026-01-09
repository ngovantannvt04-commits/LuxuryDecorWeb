import axiosClient from "@/utils/axiosClient";
import { PlaceOrderRequest, OrderResponse } from "@/types/order.types";

const ORDER_API_BASE = "http://localhost:8083/api/orders";

export const orderService = {
  
  // Đặt hàng
  placeOrder: async (data: PlaceOrderRequest): Promise<OrderResponse> => {
    return axiosClient.post("/place", data, { baseURL: ORDER_API_BASE });
  },

  // Lấy lịch sử đơn hàng
  getMyOrders: async (): Promise<OrderResponse[]> => {
    return axiosClient.get("/history", { baseURL: ORDER_API_BASE });
  },

  // Xem chi tiết 1 đơn hàng
  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    return axiosClient.get(`/${orderId}`, { baseURL: ORDER_API_BASE });
  }
};