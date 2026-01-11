"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { productService } from "@/services/product.service"; // Import service sản phẩm
import { AuthUser } from "@/types/auth.types";
import { Category } from "@/types/product.types"; // Import type Category
import { ShoppingCart, User, LogOut, Settings, History, Menu, X, LayoutDashboard, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [categories, setCategories] = useState<Category[]>([]); // State lưu danh mục
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { totalItems, clearCart, fetchCart } = useCart();

  // 1. Fetch User và Categories khi load trang
  useEffect(() => {
    const fetchData = async () => {
        // Lấy User
        const currentUser = await authService.getUser();
        setUser(currentUser);

        if (currentUser) {
            fetchCart();
        }
        // Lấy Danh mục cho Menu
        try {
            const cats = await productService.getCategories();
            setCategories(cats);
        } catch (error) {
            console.error("Lỗi tải danh mục:", error);
        }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    clearCart();
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
             <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-full font-serif font-bold text-xl">N</div>
             <span className="text-2xl font-bold font-serif tracking-wide">NIRI</span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex space-x-8 items-center h-full">
            
            {/* 1. Trang chủ */}
            <Link href="/" className="text-gray-600 hover:text-black font-medium transition h-full flex items-center">
                Trang chủ
            </Link>

            {/* 2. Danh mục */}
            <div className="relative group h-full flex items-center cursor-pointer">
                <span className="text-gray-600 group-hover:text-black font-medium transition flex items-center gap-1">
                    Danh mục <ChevronDown size={16}/>
                </span>

                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 w-56 bg-white shadow-xl rounded-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                    {/* Link "Tất cả" */}
                    <Link href="/products" className="block px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50 hover:text-amber-600">
                        Xem tất cả sản phẩm
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    {/* Render danh sách danh mục từ API */}
                    {categories.length > 0 ? (
                        categories.map((cat) => (
                            <Link 
                                key={cat.categoryId} 
                                href={`/products?categoryId=${cat.categoryId}`} // Filter theo danh mục
                                className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-amber-600 transition"
                            >
                                {cat.categoryName}
                            </Link>
                        ))
                    ) : (
                        <span className="block px-4 py-2 text-xs text-gray-400">Đang tải...</span>
                    )}
                </div>
            </div>

            {/* 3. Sản phẩm */}
            <Link href="/products" className="text-gray-600 hover:text-black font-medium transition h-full flex items-center">
                Sản phẩm
            </Link>

            {/* 4. Liên hệ */}
            <Link href="/contact" className="text-gray-600 hover:text-black font-medium transition h-full flex items-center">
                Liên hệ
            </Link>

          </div>

          {/* USER ACTIONS */}
          <div className="flex items-center space-x-6">
            <Link href="/cart" className="relative text-gray-600 right-5 hover:text-black transition">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {totalItems}
                  </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-300">
                    {user.avatar ? (
                        <Image src={user.avatar} alt="Avatar" width={36} height={36} />
                    ) : (
                        <User size={20} className="text-gray-600" />
                    )}
                  </div>
                  <span className="hidden lg:block text-sm font-semibold text-gray-800">{user.username}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in z-50">
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
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 max-h-[80vh] overflow-y-auto">
             <Link href="/" className="block text-gray-600 font-medium py-2">Trang chủ</Link>
             
             {/* Mobile Categories */}
             <div className="py-2">
                <span className="block text-gray-900 font-bold mb-2">Danh mục</span>
                <div className="pl-4 space-y-2 border-l-2 border-gray-100">
                    <Link href="/products" className="block text-sm text-gray-600">Tất cả sản phẩm</Link>
                    {categories.map(cat => (
                        <Link 
                            key={cat.categoryId} 
                            href={`/products?categoryId=${cat.categoryId}`} 
                            className="block text-sm text-gray-600"
                            onClick={() => setIsMenuOpen(false)} // Đóng menu khi click
                        >
                            {cat.categoryName}
                        </Link>
                    ))}
                </div>
             </div>

             <Link href="/products" className="block text-gray-600 font-medium py-2">Sản phẩm</Link>
             <Link href="/contact" className="block text-gray-600 font-medium py-2">Liên hệ</Link>

             {!user && (
                 <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                     <Link href="/login" className="w-full text-center py-2 border rounded-lg ">Đăng nhập</Link>
                     <Link href="/register" className="w-full text-center py-2 bg-black text-white rounded-lg">Đăng ký</Link>
                 </div>
             )}
        </div>
      )}
    </nav>
  );
}