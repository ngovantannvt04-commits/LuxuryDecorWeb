"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { BarChart3, Package, Users, ShoppingBag, LogOut } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  
  // Kiểm tra quyền Admin 
  useEffect(() => {
    const user = authService.getUser();
    if (!user || user.role !== "ADMIN") {
      router.push("/"); 
    }
  }, [router]);

  const handleLogout = () => {
      authService.logout();
      router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 fixed">
         <h2 className="text-2xl font-bold font-serif mb-8 text-center">NIRI ADMIN</h2>
         <nav className="space-y-2">
            <Link href="/admin/dashboard" className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg text-white">
                <BarChart3 size={20} /> Tổng quan
            </Link>
            <Link href="/admin/products" className="flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white">
                <Package size={20} /> Quản lý Sản phẩm
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white">
                <ShoppingBag size={20} /> Quản lý Đơn hàng
            </Link>
             <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white">
                <Users size={20} /> Quản lý Tài khoản
            </Link>
            
            <button onClick={handleLogout} className="flex w-full items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-gray-800 hover:text-red-300 mt-10">
                <LogOut size={20} /> Đăng xuất
            </button>
         </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm">Tổng doanh thu</p>
                <h3 className="text-2xl font-bold text-green-600">120,000,000đ</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm">Đơn hàng mới</p>
                <h3 className="text-2xl font-bold text-blue-600">15</h3>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm">Sản phẩm</p>
                <h3 className="text-2xl font-bold text-purple-600">48</h3>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm">Khách hàng</p>
                <h3 className="text-2xl font-bold text-orange-600">128</h3>
            </div>
        </div>

        {/* CHART PLACEHOLDER */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-96 flex items-center justify-center bg-gray-50">
            <p className="text-gray-400">Biểu đồ thống kê doanh thu (Đang cập nhật...)</p>
            
        </div>
      </main>
    </div>
  );
}