"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { AuthUser } from "@/types/auth.types";
import { ShoppingCart, User, LogOut, Settings, History, Menu, X, LayoutDashboard } from "lucide-react";
import Image from "next/image";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
        const currentUser = await authService.getUser();
        setUser(currentUser);
    };

    fetchUser();
  }, [router]);


  const handleLogout = () => {
    authService.logout();
    setUser(null);
    router.push("/login");
  };

  const navLinks = [
    { name: "Trang chủ", href: "/" },
    { name: "Danh mục", href: "/categories" },
    { name: "Sản phẩm", href: "/products" },
    { name: "Liên hệ", href: "/contact" },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
            {/* Thay bằng Logo hình ảnh nếu muốn */}
             <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-full font-serif font-bold text-xl">N</div>
             <span className="text-2xl font-bold font-serif tracking-wide">NIRI</span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-gray-600 hover:text-black font-medium transition">
                {link.name}
              </Link>
            ))}
          </div>

          {/* USER ACTIONS */}
          <div className="flex items-center space-x-6">
            {/* Giỏ hàng (Luôn hiện) */}
            <Link href="/cart" className="relative text-gray-600 hover:text-black transition">
              <ShoppingCart size={22} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">0</span>
            </Link>

            {user ? (
              // === ĐÃ ĐĂNG NHẬP (USER MENU) ===
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-300">
                    {/* Nếu có avatar url thì hiện ảnh, không thì hiện icon User */}
                    {user.avatar ? (
                        <Image src={user.avatar} alt="Avatar" width={36} height={36} />
                    ) : (
                        <User size={20} className="text-gray-600" />
                    )}
                  </div>
                  <span className="hidden lg:block text-sm font-semibold text-gray-800">{user.username}</span>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute mt-3 w-60 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900">{user.username}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 gap-2">
                        <Settings size={16} /> Thông tin cá nhân
                    </Link>
                    <Link href="/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 gap-2">
                        <History size={16} /> Lịch sử đơn hàng
                    </Link>
                    {user.role === "ADMIN" && (
                    <Link href="/admin/dashboard" className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 gap-2 font-bold">
                        <LayoutDashboard size={16} /> Trang quản trị
                    </Link>
                    )}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button onClick={handleLogout} className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 gap-2">
                        <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // === CHƯA ĐĂNG NHẬP ===
              <div className="hidden md:flex items-center gap-4">
                <Link href="/login" className="text-gray-700 font-medium hover:text-black">Đăng nhập</Link>
                <Link href="/register" className="bg-black text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 transition shadow-lg">
                   Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4">
             {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="block text-gray-600 font-medium py-2">
                {link.name}
              </Link>
            ))}
             {!user && (
                 <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                     <Link href="/login" className="w-full text-center py-2 border rounded-lg">Đăng nhập</Link>
                     <Link href="/register" className="w-full text-center py-2 bg-black text-white rounded-lg">Đăng ký</Link>
                 </div>
             )}
        </div>
      )}
    </nav>
  );
}