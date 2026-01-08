"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/services/auth.service";
import { BarChart3, Package, Users, ShoppingBag, LogOut, Home } from "lucide-react";
import Link from "next/link";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const activeClass =
  "bg-gray-800 text-white";

  const inactiveClass =
  "text-gray-400 hover:bg-gray-800 hover:text-white";

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
            <Link href="/admin/dashboard" className={`flex items-center gap-3 p-3 rounded-lg ${pathname === "/admin/dashboard" ? activeClass : inactiveClass}`}>
                <BarChart3 size={20} /> Tổng quan
            </Link>
            <Link href="/admin/products" className={`flex items-center gap-3 p-3 rounded-lg ${pathname === "/admin/products" ? activeClass : inactiveClass}`}>
                <Package size={20} /> Quản lý Sản phẩm
            </Link>
            <Link href="/admin/orders" className={`flex items-center gap-3 p-3 rounded-lg ${pathname === "/admin/orders" ? activeClass : inactiveClass}`}>
                <ShoppingBag size={20} /> Quản lý Đơn hàng
            </Link>
             <Link href="/admin/users" className={`flex items-center gap-3 p-3 rounded-lg ${pathname === "/admin/users" ? activeClass : inactiveClass}`}>
                <Users size={20} /> Quản lý Tài khoản
            </Link>
            <Link
              href="/"
              className={`flex items-center gap-3 p-3 rounded-lg ${
                pathname === "/" ? activeClass : inactiveClass
              }`}
            >
              <Home size={20} /> Xem trang chủ
            </Link>
            <button onClick={handleLogout} className="flex w-full items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-gray-800 hover:text-red-300 mt-10">
                <LogOut size={20} /> Đăng xuất
            </button>
         </nav>
      </aside>
    </div>
  );
}