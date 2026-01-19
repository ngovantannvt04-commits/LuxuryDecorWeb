"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/user.service";
import { productService } from "@/services/product.service";
import { orderService } from "@/services/order.service";
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// 👇 Định nghĩa Interface cho State của Dashboard để code tường minh
interface DashboardState {
    users: {
        total: number;
        customers: number;
    };
    products: {
        total: number;
        lowStock: number;
    };
    orders: {
        totalRevenue: number;
        totalOrders: number;
        pending: number;
        shipping: number;
        success: number;
        cancelled: number;
    };
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<{month: string, revenue: number}[]>([]);

  // Khởi tạo state với kiểu dữ liệu rõ ràng
  const [stats, setStats] = useState<DashboardState>({
    users: { total: 0, customers: 0 },
    products: { total: 0, lowStock: 0 },
    orders: {
        totalRevenue: 0,
        totalOrders: 0,
        pending: 0,
        shipping: 0,
        success: 0,
        cancelled: 0
    }
  });

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        // Promise.all giờ trả về đúng kiểu [UserStatsResponse, ProductStatsResponse, OrderStatsResponse]
        const [userRes, productRes, orderRes, chartRes] = await Promise.all([
            userService.getStats(),
            productService.getStats(),
            orderService.getStats(),
            orderService.getRevenueChart()
        ]);

        // Mapping dữ liệu (TypeScript sẽ gợi ý code ở đây cực chuẩn)
        setStats({
            users: {
                total: userRes.total_users,         // Backend trả snake_case
                customers: userRes.total_customers
            },
            products: {
                total: productRes.total_products,
                lowStock: productRes.low_stock_products
            },
            orders: {
                totalRevenue: orderRes.totalRevenue, // Backend trả camelCase (do DTO)
                totalOrders: orderRes.totalOrders,
                pending: orderRes.pendingOrders,
                shipping: orderRes.shippingOrders,
                success: orderRes.successOrders,
                cancelled: orderRes.cancelledOrders
            }
        });

        setRevenueData(chartRes as unknown as {month: string, revenue: number}[]);

      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, []);

  // Hàm format tiền tệ dạng rút gọn cho trục Y (VD: 1M, 500k...)
  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${value / 1000000}M`;
    if (value >= 1000) return `${value / 1000}k`;
    return value.toString();
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // Dữ liệu biểu đồ
  const pieData = [
    { name: 'Chờ xử lý', value: stats.orders.pending, color: '#F59E0B' },
    { name: 'Đang giao', value: stats.orders.shipping, color: '#3B82F6' },
    { name: 'Thành công', value: stats.orders.success, color: '#10B981' },
    { name: 'Đã hủy', value: stats.orders.cancelled, color: '#EF4444' },
  ].filter(item => item.value > 0);

  if (loading) return <div className="min-h-[400px] flex items-center justify-center">Đang tải dữ liệu dashboard...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>

        {/* 1. SECTION: SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Doanh thu */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Tổng Doanh Thu</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.orders.totalRevenue)}</h3>
                    <p className="text-green-600 text-xs flex items-center gap-1 mt-2">
                        <TrendingUp size={12}/> +Doanh thu thực tế
                    </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                    <DollarSign size={24} />
                </div>
            </div>

            {/* Card 2: Đơn hàng */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Tổng Đơn Hàng</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.orders.totalOrders}</h3>
                    <p className="text-gray-400 text-xs mt-2">Đơn hàng toàn hệ thống</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                    <ShoppingBag size={24} />
                </div>
            </div>

            {/* Card 3: Khách hàng */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Khách Hàng</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.users.customers}</h3>
                    <p className="text-gray-400 text-xs mt-2">Trên tổng {stats.users.total} tài khoản</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                    <Users size={24} />
                </div>
            </div>

            {/* Card 4: Sản phẩm */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Sản Phẩm</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.products.total}</h3>
                    {stats.products.lowStock > 0 ? (
                        <p className="text-red-500 text-xs flex items-center gap-1 mt-2 font-medium">
                            <AlertTriangle size={12}/> {stats.products.lowStock} SP sắp hết hàng
                        </p>
                    ) : (
                         <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                             <Package size={12}/> Kho hàng ổn định
                         </p>
                    )}
                </div>
                <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                    <Package size={24} />
                </div>
            </div>
        </div>

        {/* 2. SECTION: CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Trạng thái đơn hàng */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Tỷ lệ trạng thái đơn hàng</h3>
                <div className="h-80 w-full">
                    {stats.orders.totalOrders > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value} đơn`} />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                            Chưa có dữ liệu đơn hàng
                        </div>
                    )}
                </div>
            </div>

            {/* Chart 2: Biểu đồ doanh thu */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800">Doanh thu năm nay</h3>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Đơn vị: VNĐ
                    </div>
                 </div>

                 <div className="h-80 w-full">
                    {revenueData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 12, fill: '#6B7280'}}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 12, fill: '#6B7280'}}
                                    tickFormatter={formatYAxis}
                                />
                                <Tooltip 
                                    cursor={{fill: '#F3F4F6'}}
                                    formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar 
                                    dataKey="revenue" 
                                    fill="#3B82F6" 
                                    radius={[4, 4, 0, 0]} 
                                    barSize={30}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            Chưa có dữ liệu doanh thu
                        </div>
                    )}
                 </div>
            </div>
        </div>
    </div>
  );
}