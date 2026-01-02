"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Kiểm tra trạng thái đăng nhập khi load trang
  useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const token = sessionStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  if (!mounted) return null; 

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar đơn giản */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold font-serif">LUXURY DECOR</h1>
            <div>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                >
                  Đăng xuất
                </button>
              ) : (
                <div className="space-x-4">
                  <Link href="/login" className="text-gray-700 hover:text-black font-medium">
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
          Nâng tầm không gian sống
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
          Khám phá bộ sưu tập nội thất đẳng cấp, sang trọng dành riêng cho ngôi nhà của bạn.
        </p>
        <div className="mt-8 flex justify-center gap-4">
           {/* Thêm nội dung demo */}
           <div className="p-6 bg-gray-100 rounded-lg">
              <p className="font-mono text-sm text-gray-600">
                {isLoggedIn ? "✅ Bạn đang ở chế độ đã đăng nhập" : "🔒 Bạn đang xem với tư cách khách"}
              </p>
           </div>
        </div>
      </main>
    </div>
  );
}