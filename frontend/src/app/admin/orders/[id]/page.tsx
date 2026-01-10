"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { orderService } from "@/services/order.service";
import { OrderResponse } from "@/types/order.types";
import { ArrowLeft, Save, Loader2, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State để cập nhật trạng thái
  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!params.id) return;
      try {
        const res = await orderService.getOrderById(params.id as string);
        setOrder(res);
        setStatus(res.status); // Set trạng thái hiện tại vào select box
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [params.id]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    setUpdating(true);
    try {
        // Gọi API cập nhật
        await orderService.updateStatus(order.orderId, status);
        alert("Cập nhật trạng thái thành công!");
        
        // Reload lại dữ liệu để chắc chắn
        const res = await orderService.getOrderById(order.orderId);
        setOrder(res);
    } catch (error) {
        alert("Có lỗi xảy ra khi cập nhật");
        console.error(error);
    } finally {
        setUpdating(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  if (loading) return <div className="text-center py-20">Đang tải...</div>;
  if (!order) return <div>Không tìm thấy đơn hàng</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-5xl mx-auto px-4 py-8">
        
        <Link href="/admin/orders" className="inline-flex items-center text-gray-500 hover:text-black mb-6">
            <ArrowLeft size={18} className="mr-2"/> Quay lại danh sách
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CỘT TRÁI: THÔNG TIN CHI TIẾT (Re-use logic UI của User) */}
            <div className="lg:col-span-2 space-y-6">
                 {/* ... Phần hiển thị sản phẩm và địa chỉ (Copy từ trang User Order Detail qua đây) ... */}
                 {/* Để tiết kiệm text, bạn có thể copy code phần render của user/orders/[id]/page.tsx vào đây */}
                 {/* Ví dụ tóm tắt: */}
                 <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="font-bold text-lg mb-4">Sản phẩm trong đơn</h2>
                    {order.orderDetails.map((item, idx) => (
                        <div key={idx} className="flex gap-4 py-2 border-b last:border-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.thumbnail || "https://placehold.co/50"} alt={item.productName} className="w-12 h-12 rounded object-cover"/>
                            <div className="flex-1">
                                <p className="font-medium">{item.productName}</p>
                                <p className="text-sm text-gray-500">x{item.quantity}</p>
                            </div>
                            <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                    ))}
                    <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t">
                        <span>Tổng cộng</span>
                        <span className="text-amber-700">{formatCurrency(order.totalMoney)}</span>
                    </div>
                 </div>

                 <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="font-bold text-lg mb-4">Thông tin khách hàng</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Họ tên</p>
                            <p className="font-medium">{order.fullName}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Số điện thoại</p>
                            <p className="font-medium">{order.phoneNumber}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-gray-500">Địa chỉ</p>
                            <p className="font-medium">{order.address}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-gray-500">Ghi chú</p>
                            <p className="font-medium">{order.note || "Không có"}</p>
                        </div>
                    </div>
                 </div>
            </div>

            {/* CỘT PHẢI: ADMIN CONTROL PANEL (QUAN TRỌNG) */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 sticky top-4">
                    <h3 className="font-bold text-lg mb-4 text-blue-800">Cập nhật trạng thái</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái hiện tại</label>
                            <div className="relative">
                                <select 
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="appearance-none w-full p-3 border rounded-lg bg-gray-50 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="PENDING">🕒 Chờ xử lý </option>
                                    <option value="CONFIRMED">✅ Đã xác nhận </option>
                                    <option value="SHIPPING">🚚 Đang giao hàng </option>
                                    <option value="DELIVERED">🎁 Giao thành công </option>
                                    <option value="CANCELLED">❌ Đã hủy </option>
                                </select>
                                <ChevronDown size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black-500" />
                            </div>
                        </div>

                        <button 
                            onClick={handleUpdateStatus}
                            disabled={updating || status === order.status}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-gray-300"
                        >
                            {updating ? <Loader2 className="animate-spin"/> : <><Save size={18}/> Lưu thay đổi</>}
                        </button>
                    </div>

                    <div className="mt-6 pt-4 border-t text-xs text-gray-500">
                        <p>Lưu ý:</p>
                        <ul className="list-disc pl-4 space-y-1 mt-1">
                            <li>Chuyển sang <b>DELIVERED</b> sẽ ghi nhận doanh thu.</li>
                            <li>Chuyển sang <b>CANCELLED</b> sẽ hoàn lại tồn kho (cần code backend xử lý thêm logic này nếu muốn).</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}