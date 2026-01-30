"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/user.service";
import { productService } from "@/services/product.service";
import { orderService } from "@/services/order.service";
import { DollarSign, ShoppingBag, Users, Package, AlertTriangle, ArrowRight, Archive, ExternalLink, X } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Link from "next/link";
import Image from "next/image";

// 1. Định nghĩa kiểu dữ liệu cho sản phẩm trong list
interface ProductItem {
  productId: number;
  productName: string;
  image: string;
  stockQuantity: number;
  price: number;
  categoryName: string;
}

// 2. Định nghĩa kiểu dữ liệu trả về từ API Product Stats (để tránh dùng as any)
interface ProductStatsAPIResponse {
    total_products: number;
    low_stock_products: number;
    low_stock_list?: ProductItem[];
    high_stock_list?: ProductItem[];
}

// 3. Interface cho State Dashboard
interface DashboardState {
  users: { total: number; customers: number; };
  products: { 
      total: number; 
      lowStock: number; 
      lowStockList: ProductItem[]; 
      highStockList: ProductItem[]; 
  };
  orders: {
      totalRevenue: number; totalOrders: number; pending: number; shipping: number; success: number; cancelled: number;
  };
}

// 4. Interface cho Props của Widget con (Thay thế cho any)
interface ProductListWidgetProps {
    title: string;
    icon: React.ReactNode; // Icon là ReactNode
    color: string;         // Class string (vd: text-red-600)
    data: ProductItem[];
    emptyText: string;
    linkTo: string;
    type: 'low' | 'high';  // Chỉ nhận 2 giá trị này để style
    onImageClick: (url: string) => void;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<{month: string, revenue: number}[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardState>({
    users: { total: 0, customers: 0 },
    products: { total: 0, lowStock: 0, lowStockList: [], highStockList: [] },
    orders: { totalRevenue: 0, totalOrders: 0, pending: 0, shipping: 0, success: 0, cancelled: 0 }
  });

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const [userRes, productRes, orderRes, chartRes] = await Promise.all([
            userService.getStats(),
            productService.getStats(),
            orderService.getStats(),
            orderService.getRevenueChart()
        ]);

        // Ép kiểu an toàn dựa trên Interface đã định nghĩa ở trên
        // Thay vì dùng (productRes as any), ta dùng (productRes as unknown as ProductStatsAPIResponse)
        const pRes = productRes as unknown as ProductStatsAPIResponse;

        setStats({
            users: { total: userRes.total_users, customers: userRes.total_customers },
            products: {
                total: pRes.total_products,
                lowStock: pRes.low_stock_products,
                lowStockList: pRes.low_stock_list || [],
                highStockList: pRes.high_stock_list || [] 
            },
            orders: {
                totalRevenue: orderRes.totalRevenue, totalOrders: orderRes.totalOrders,
                pending: orderRes.pendingOrders, shipping: orderRes.shippingOrders,
                success: orderRes.successOrders, cancelled: orderRes.cancelledOrders
            }
        });
        setRevenueData(chartRes as unknown as {month: string, revenue: number}[]);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchAllStats();
  }, []);

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  const formatYAxis = (value: number) => value >= 1000000 ? `${value / 1000000}M` : `${value / 1000}k`;

  const pieData = [
    { name: 'Chờ xử lý', value: stats.orders.pending, color: '#F59E0B' },
    { name: 'Đang giao', value: stats.orders.shipping, color: '#3B82F6' },
    { name: 'Thành công', value: stats.orders.success, color: '#10B981' },
    { name: 'Đã hủy', value: stats.orders.cancelled, color: '#EF4444' },
  ].filter(item => item.value > 0);

  const ProductListWidget = ({ title, icon, color, data, emptyText, linkTo, type, onImageClick }: ProductListWidgetProps) => (
    <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full ${type === 'low' ? 'border-red-50' : 'border-blue-50'}`}>
        {/* Header Widget */}
        <div className="flex justify-between items-center mb-4">
            <h3 className={`font-bold text-sm flex items-center gap-2 ${color}`}>
                {icon} {title}
            </h3>
            {linkTo && (
                <Link href={linkTo} className="text-xs text-gray-400 hover:text-gray-800 flex items-center gap-1 transition">
                    Tất cả <ArrowRight size={12}/>
                </Link>
            )}
        </div>

        {/* Content List: Bỏ overflow-y, bỏ max-h */}
        <div className="flex-1 space-y-3">
            {data.length > 0 ? (
                data.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition border border-gray-50 group">
                        {/* Ảnh */}
                        <div 
                            className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border cursor-pointer hover:opacity-80 transition"
                            onClick={() => onImageClick(item.image || "https://placehold.co/400")}
                        >
                            <Image src={item.image || "https://placehold.co/40"} alt="" fill className="object-cover"/>
                        </div>
                        
                        {/* Thông tin */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <p className="text-sm font-medium text-gray-800 truncate pr-2" title={item.productName}>
                                    {item.productName}
                                </p>
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${type === 'low' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {item.stockQuantity}
                                </span>
                            </div>
                            <Link href={`/admin/products/${item.productId}`} className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 mt-0.5 hover:text-blue-500">
                                Xem chi tiết <ExternalLink size={10}/>
                            </Link>
                        </div>
                    </div>
                ))
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs py-8">
                    <Package size={24} className="mb-2 opacity-20"/>
                    {emptyText}
                </div>
            )}
        </div>
    </div>
  );

  if (loading) return <div className="min-h-[400px] flex items-center justify-center">Đang tải dữ liệu dashboard...</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>

        {/* 1. HÀNG 1: 4 CARD THỐNG KÊ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Tổng Doanh Thu</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.orders.totalRevenue)}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full text-green-600"><DollarSign size={24} /></div>
            </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Tổng Đơn Hàng</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.orders.totalOrders}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full text-blue-600"><ShoppingBag size={24} /></div>
            </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Khách Hàng</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.users.customers}</h3>
                </div>
                <div className="bg-orange-100 p-3 rounded-full text-orange-600"><Users size={24} /></div>
            </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Sản Phẩm</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.products.total}</h3>
                    <p className="text-red-500 text-xs mt-1 font-bold">{stats.products.lowStock} cần nhập</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full text-purple-600"><Package size={24} /></div>
            </div>
        </div>

        {/* 2. HÀNG 2: BIỂU ĐỒ DOANH THU (2/3) + PIE CHART (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800">Biểu đồ doanh thu</h3>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">VNĐ</div>
                </div>
                <div className="h-80 w-full">
                    {revenueData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} tickFormatter={formatYAxis} />
                                <Tooltip cursor={{fill: '#F3F4F6'}} formatter={(val: number | undefined) => formatCurrency(val || 0)} />
                                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : ( <div className="h-full flex items-center justify-center text-gray-400">Chưa có dữ liệu</div> )}
                </div>
            </div>

            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h3 className="font-bold text-gray-800 mb-4">Trạng thái đơn hàng</h3>
                <div className="flex-1 min-h-[250px]">
                    {stats.orders.totalOrders > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : ( <div className="h-full flex items-center justify-center text-gray-400 text-xs">Chưa có đơn hàng</div> )}
                </div>
            </div>
        </div>

        {/* 3. HÀNG 3: HAI BẢNG DANH SÁCH (Cân đối 50-50) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Widget: Sắp hết hàng */}
            <ProductListWidget 
                title="Sản phẩm sắp hết hàng" 
                icon={<AlertTriangle size={18}/>} 
                color="text-red-600"
                type="low"
                data={stats.products.lowStockList}
                emptyText="Kho hàng ổn định"
                linkTo="/admin/products/low-stock"
                onImageClick={setPreviewImage}
            />

            {/* Widget: Tồn kho nhiều */}
            <ProductListWidget 
                title="Sản phẩm tồn kho nhiều" 
                icon={<Archive size={18}/>} 
                color="text-blue-600"
                type="high"
                data={stats.products.highStockList}
                emptyText="Không có dữ liệu tồn kho"
                linkTo="/admin/products"
                onImageClick={setPreviewImage}
            />
        </div>
        {/* 👇 MODAL PHÓNG TO ẢNH (LIGHTBOX) */}
        {previewImage && (
            <div 
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => setPreviewImage(null)} // Click ra ngoài thì đóng
            >
                {/* Nút đóng */}
                <button 
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
                    onClick={() => setPreviewImage(null)}
                >
                    <X size={24} />
                </button>

                {/* Ảnh lớn */}
                <div 
                    className="relative max-w-[90vw] max-h-[90vh] overflow-hidden rounded-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()} // Click vào ảnh thì không đóng
                >
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="max-w-full max-h-[90vh] object-contain"
                    />
                </div>
            </div>
        )}
    </div>
  );
}