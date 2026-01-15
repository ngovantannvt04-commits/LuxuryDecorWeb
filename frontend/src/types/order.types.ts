
export interface PlaceOrderRequest {
  fullName: string;
  phoneNumber: string;
  address: string;
  note: string;
  paymentMethod: string; 
  selectedProductIds: number[];
}

export interface OrderDetailResponse {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  thumbnail?: string; 
}


export interface OrderResponse {
  orderId: string;     
  fullName: string;
  phoneNumber: string;
  address: string;
  note: string;
  status: string;       
  totalMoney: number;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: string;     
  orderDetails: OrderDetailResponse[];
}

export interface OrderStatsResponse {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    shippingOrders: number;
    successOrders: number;
    cancelledOrders: number;
}

export interface RevenueChartData {
    month: string;
    revenue: number;
}