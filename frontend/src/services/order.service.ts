import axiosClient from "@/utils/axiosClient";
import { PlaceOrderRequest, OrderResponse, OrderStatsResponse, RevenueChartData, PaymentUrlResponse, PaymentCallbackResponse, VNPayCallbackParams } from "@/types/order.types";
import { PageResponse } from "@/types/auth.types";

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

  // Hủy đơn từ phía khách hàng
  cancelOrder: async (orderId: string): Promise<OrderResponse> => {
    return axiosClient.put(`/${orderId}/cancel`, null, { baseURL: ORDER_API_BASE });
  },

  // Xem chi tiết 1 đơn hàng
  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    return axiosClient.get(`/${orderId}`, { baseURL: ORDER_API_BASE });
  },  

  // Quản trị: Lấy tất cả đơn hàng với phân trang và tìm kiếm
  getAllOrders: async (page: number = 0, size: number = 10, keyword: string = ""): Promise<PageResponse<OrderResponse>> => {
    return axiosClient.get("/admin", {
      baseURL: ORDER_API_BASE,
      params: { page, size, keyword }
    });
  },

  // Cập nhật trạng thái đơn hàng
  updateStatus: async (orderId: string, status: string): Promise<OrderResponse> => {
    return axiosClient.put(`/admin/${orderId}/status`, null, {
      baseURL: ORDER_API_BASE,
      params: { status } // Gửi dưới dạng query param ?status=...
    });
  },

  getStats: async (): Promise<OrderStatsResponse> => {
    return axiosClient.get("/stats", { baseURL: ORDER_API_BASE }) as Promise<OrderStatsResponse>;
  },

  getRevenueChart: async (): Promise<RevenueChartData[]> => {
      const currentYear = new Date().getFullYear();
      return axiosClient.get(`/revenue-chart?year=${currentYear}`, { baseURL: ORDER_API_BASE }) as Promise<RevenueChartData[]>;
  },

  createPaymentUrl: async (amount: number, orderInfo: string, orderId: string): Promise<string> => {
      const res = await axiosClient.get(
          `/payment/create_payment?amount=${amount}&orderInfo=${orderInfo}&orderId=${orderId}`, { baseURL: `http://localhost:8083` }
      );
      const data = res as unknown as PaymentUrlResponse;
      return data.url;
  },

  handlePaymentCallback: async (params: VNPayCallbackParams): Promise<PaymentCallbackResponse> => {
      const res = await axiosClient.get("/payment/vnpay-callback", { params, baseURL: `http://localhost:8083` });
      return res as unknown as PaymentCallbackResponse;
  }
};