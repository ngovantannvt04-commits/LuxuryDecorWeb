"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { orderService } from "@/services/order.service";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { OrderResponse } from "@/types/order.types";
import { ArrowLeft, MapPin, User, Phone, CreditCard, Package, FileText, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { AxiosError } from "axios";

export default function OrderDetailPage() {
  const params = useParams(); // Lấy ID từ URL
  const router = useRouter();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!params.id) return;
      try {
        const res = await orderService.getOrderById(params.id as string);
        setOrder(res);
      } catch (error) {
        console.error("Lỗi lấy chi tiết đơn:", error);
        // Nếu lỗi (ví dụ nhập ID bậy), quay về trang danh sách
        router.push("/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [params.id, router]);

  // Helper function để hiển thị tên phương thức thanh toán đẹp hơn
  const getPaymentMethodName = (method: string) => {
      if (method === 'COD') return 'Thanh toán khi nhận hàng';
      if (method === 'VNPAY') return 'Thanh toán qua VNPAY';
      return method;
  };

  // Helper function để render trạng thái thanh toán có màu sắc
  const renderPaymentStatus = (status: string) => {
      if (status === 'PAID') {
          return <span className="text-green-600 font-bold">Đã thanh toán</span>;
      }
      return <span className="text-yellow-600 font-bold">Chưa thanh toán</span>;
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    // Xác nhận
    const confirm = window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.");
    if (!confirm) return;

    setCancelling(true);
    try {
        // Gọi API
        await orderService.cancelOrder(order.orderId);
        alert("Đã hủy đơn hàng thành công!");
        window.location.reload(); 
    } catch (error) {
        console.error(error);
        const err = error as AxiosError<{ message: string }>;
        const errorMsg = err.response?.data?.message || "Có lỗi xảy ra, không thể hủy đơn.";
        alert(errorMsg);
    } finally {
        setCancelling(false);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  if (loading) return <div className="text-center py-20">Đang tải chi tiết đơn hàng...</div>;
  if (!order) return null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10">
        
        {/* Nút Back */}
        <Link href="/orders" className="inline-flex items-center text-gray-500 hover:text-black mb-6">
          <ArrowLeft size={18} className="mr-2"/> Quay lại lịch sử
        </Link>

        {/* Tiêu đề & Trạng thái */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
             <h1 className="text-2xl font-serif font-bold">Đơn hàng #{order.orderId}</h1>
             <p className="text-sm text-gray-500">Đặt ngày: {new Date(order.orderDate).toLocaleString('vi-VN')}</p>
          </div>

          <div className="flex items-center gap-3">
             {order.status === "PENDING" && (
                 <button 
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-full font-bold text-sm hover:bg-red-50 transition disabled:opacity-50"
                 >
                    {cancelling ? <Loader2 size={16} className="animate-spin"/> : <XCircle size={16}/>}
                    Hủy đơn hàng
                 </button>
             )}

             <span className={`px-4 py-2 rounded-full text-sm font-bold text-white
                ${order.status === 'PENDING' ? 'bg-yellow-500' : ''}
                ${order.status === 'CONFIRMED' ? 'bg-blue-600' : ''}
                ${order.status === 'SHIPPING' ? 'bg-purple-600' : ''}
                ${order.status === 'DELIVERED' ? 'bg-green-600' : ''}
                ${order.status === 'CANCELLED' ? 'bg-red-500' : ''}
             `}>
               {order.status}
             </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CỘT TRÁI: THÔNG TIN VẬN CHUYỂN */}
            <div className="md:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold border-b pb-3 mb-3 flex items-center gap-2">
                        <User size={18}/> Người nhận
                    </h3>
                    <p className="font-medium">{order.fullName}</p>
                    <p className="text-gray-500 text-sm flex items-center gap-2 mt-2">
                        <Phone size={14}/> {order.phoneNumber}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold border-b pb-3 mb-3 flex items-center gap-2">
                        <MapPin size={18}/> Địa chỉ giao hàng
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{order.address}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold border-b pb-3 mb-3 flex items-center gap-2 text-gray-800">
                        <FileText size={18}/> Ghi chú đơn hàng
                    </h3>
                    {order.note ? (
                        <p className="text-amber-700 text-sm italic font-medium bg-amber-50 p-3 rounded-lg border border-amber-100">
                            &ldquo;{order.note}&rdquo;
                        </p>
                    ) : (
                        <p className="text-gray-400 text-sm italic">Không có ghi chú</p>
                    )}
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold border-b pb-3 mb-3 flex items-center gap-2">
                         <CreditCard size={18}/> Thanh toán
                    </h3>
                    <p className="text-gray-600 text-sm">Phương thức: <span className="font-bold text-gray-800">{getPaymentMethodName(order.paymentMethod)}</span></p>
                    <p className="text-gray-600 text-sm mt-1">Trạng thái: {renderPaymentStatus(order.paymentStatus)}</p>
                </div>
            </div>

            {/* CỘT PHẢI: DANH SÁCH SẢN PHẨM */}
            <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm h-fit">
                <h3 className="font-bold border-b pb-3 mb-4 flex items-center gap-2">
                    <Package size={18}/> Sản phẩm ({order.orderDetails.length})
                </h3>
                
                <div className="space-y-4">
                    {order.orderDetails.map((item, index) => (
                        <div key={index} className="flex gap-4 items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                            <div className="w-16 h-16 bg-gray-100 rounded border overflow-hidden flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.thumbnail || "https://placehold.co/100"} alt={item.productName} className="object-cover w-full h-full"/>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900 line-clamp-2">{item.productName}</h4>
                                <p className="text-sm text-gray-500">x{item.quantity}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                                <p className="text-xs text-gray-400">{formatCurrency(item.price)} / cái</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-100 mt-6 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-600">
                        <span>Tạm tính</span>
                        <span>{formatCurrency(order.totalMoney)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Phí vận chuyển</span>
                        <span className="text-green-600">Miễn phí</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-amber-700 pt-2 border-t border-dashed">
                        <span>Tổng cộng</span>
                        <span>{formatCurrency(order.totalMoney)}</span>
                    </div>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}