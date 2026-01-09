"use client";

import { useEffect, useState } from "react";
import { orderService } from "@/services/order.service";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Package, Truck, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { OrderResponse, OrderDetailResponse } from "@/types/order.types"; 

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getMyOrders();
        setOrders(res);
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Hàm render badge trạng thái
  const renderStatus = (status: string) => {
    switch (status) {
      case "PENDING": return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12}/> Chờ xử lý</span>;
      case "CONFIRMED": return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Đã xác nhận</span>;
      case "SHIPPING": return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Truck size={12}/> Đang giao</span>;
      case "DELIVERED": return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Package size={12}/> Giao thành công</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif font-bold mb-8">Lịch sử đơn hàng</h1>

        {loading ? (
           <div className="text-center py-20">Đang tải dữ liệu...</div>
        ) : orders.length === 0 ? (
           <div className="bg-white p-10 rounded-xl text-center shadow-sm">
              <Package size={48} className="mx-auto text-gray-300 mb-4"/>
              <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
              <Link href="/products" className="text-blue-600 font-bold mt-2 inline-block">Mua sắm ngay</Link>
           </div>
        ) : (
           <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.orderId} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                   <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-gray-100 pb-4 mb-4">
                      <div>
                         <div className="flex items-center gap-3 mb-1">
                            <span className="text-lg font-bold text-gray-900">#{order.orderId}</span>
                            {renderStatus(order.status)}
                         </div>
                         <p className="text-sm text-gray-500">Ngày đặt: {new Date(order.orderDate).toLocaleString('vi-VN')}</p>
                      </div>
                      <div className="mt-2 md:mt-0 text-right">
                         <p className="text-sm text-gray-500">Tổng tiền</p>
                         <p className="text-xl font-bold text-amber-700">{formatCurrency(order.totalMoney)}</p>
                      </div>
                   </div>

                   {/* List sản phẩm rút gọn */}
                   <div className="space-y-3">
                      {order.orderDetails.slice(0, 2).map((item, idx) => (
                         <div key={idx} className="flex items-center gap-4">
                            <div className="w-25 h-25 bg-gray-100 rounded border border-gray-200 relative overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                               <img 
                                 src={item.thumbnail || "https://placehold.co/100"} 
                                 alt={item.productName} 
                                 className="object-cover w-full h-full"
                               />
                            </div>
                            <div className="flex-1 ml-2">
                               <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.productName}</p>
                               <p className="text-xs text-gray-500">x{item.quantity}</p>
                            </div>
                         </div>
                      ))}
                      {order.orderDetails.length > 2 && (
                         <p className="text-xs text-gray-400 italic">+ {order.orderDetails.length - 2} sản phẩm khác</p>
                      )}
                   </div>

                   <div className="mt-6 flex justify-end">
                      <Link href={`/orders/${order.orderId}`} className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition">
                         Xem chi tiết <ChevronRight size={16}/>
                      </Link>
                   </div>
                </div>
              ))}
           </div>
        )}
      </main>
      <Footer />
    </div>
  );
}