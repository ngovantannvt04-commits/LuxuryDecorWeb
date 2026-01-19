
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

export interface PaymentUrlResponse {
  url: string;
}

export interface PaymentCallbackResponse {
    status: "success" | "failed" | "error";
    message: string;
    orderId?: string;
}

export interface VNPayCallbackParams {
    vnp_Amount: string;
    vnp_BankCode: string;
    vnp_BankTranNo?: string; 
    vnp_CardType?: string;
    vnp_OrderInfo: string;
    vnp_PayDate: string;
    vnp_ResponseCode: string;
    vnp_TmnCode: string;
    vnp_TransactionNo: string;
    vnp_TransactionStatus: string;
    vnp_TxnRef: string;
    vnp_SecureHash: string;
    vnp_SecureHashType?: string;
}