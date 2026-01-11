"use client";

import { useEffect, useState } from "react";
import { orderService } from "@/services/order.service";
import { OrderResponse } from "@/types/order.types";
import { PageResponse } from "@/types/auth.types";
import Link from "next/link";
import { Eye, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";

export default function AdminOrderListPage() {
  const [data, setData] = useState<PageResponse<OrderResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");

  const fetchOrders = async (pageIdx: number) => {
    setLoading(true);
    try {
      const res = await orderService.getAllOrders(pageIdx, 10, keyword);
      setData(res);
      setPage(pageIdx);
    } catch (error) {
      console.error("Lỗi tải danh sách đơn:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(0);
  }, []); // Load lần đầu

  // Hàm render badge trạng thái (Copy lại từ User page hoặc tách ra Component chung)
  const renderStatusBadge = (status: string) => {
    let colorClass = "bg-gray-100 text-gray-800";
    if (status === "PENDING") colorClass = "bg-yellow-100 text-yellow-800";
    else if (status === "CONFIRMED") colorClass = "bg-blue-100 text-blue-800";
    else if (status === "SHIPPING") colorClass = "bg-purple-100 text-purple-800";
    else if (status === "DELIVERED") colorClass = "bg-green-100 text-green-800";
    else if (status === "CANCELLED") colorClass = "bg-red-100 text-red-800";

    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${colorClass}`}>{status}</span>;
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="bg-gray-50 min-h-screen">
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold font-serif">Quản lý đơn hàng</h1>
            
            {/* Search Box đơn giản */}
            <div className="flex gap-2">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                    <input 
                        type="text" 
                        placeholder="Mã đơn, SĐT..."
                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchOrders(0)}
                    />
                </div>
                <button 
                    onClick={() => fetchOrders(0)}
                    className="bg-black text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800"
                >
                    Tìm
                </button>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* TABLE HEADER */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-100 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">Mã đơn</th>
                            <th className="px-6 py-4">Khách hàng</th>
                            <th className="px-6 py-4">Ngày đặt</th>
                            <th className="px-6 py-4">Tổng tiền</th>
                            <th className="px-6 py-4 text-center">Trạng thái</th>
                            <th className="px-6 py-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-10">Đang tải...</td></tr>
                        ) : data?.content.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-10">Không tìm thấy đơn hàng nào</td></tr>
                        ) : (
                            data?.content.map((order) => (
                                <tr key={order.orderId} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-bold text-gray-900">#{order.orderId}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{order.fullName}</p>
                                        <p className="text-xs text-gray-400">{order.phoneNumber}</p>
                                    </td>
                                    <td className="px-6 py-4">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                                    <td className="px-6 py-4 font-bold text-amber-700">{formatCurrency(order.totalMoney)}</td>
                                    <td className="px-6 py-4 text-center">{renderStatusBadge(order.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/orders/${order.orderId}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium mr-2">
                                            <Eye size={16}/> Chi tiết
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            {data && data.totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex justify-end items-center gap-2">
                    <button 
                        onClick={() => fetchOrders(page - 1)}
                        disabled={page === 0}
                        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        <ChevronLeft size={16}/>
                    </button>
                    <span className="text-sm">
                        Trang <b>{page + 1}</b> / {data.totalPages}
                    </span>
                    <button 
                         onClick={() => fetchOrders(page + 1)}
                         disabled={page === data.totalPages - 1}
                         className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        <ChevronRight size={16}/>
                    </button>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}