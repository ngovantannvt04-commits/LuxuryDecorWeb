"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import Link from "next/link";
import { AxiosError } from "axios";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    repassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.repassword) {
      setError("Mật khẩu nhập lại không khớp!");
      return;
    }

    setLoading(true);

    try {
      await authService.register(formData);
      router.push("/verify?email=${encodeURIComponent(formData.email)}");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. CONTAINER CHÍNH
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

      {/* 2. CARD WRAPPER: Giống hệt trang Login */}
      <div className="flex w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[600px]">

        {/* === CỘT TRÁI: FORM ĐĂNG KÝ (Chiếm 50%) === */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white border-r border-gray-100">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 font-serif">Tạo tài khoản</h2>
            <p className="text-gray-500 mt-2">Gia nhập cộng đồng Luxury Decor</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            {/* User Name */}
            <div>
               <label className="text-sm font-medium text-gray-700 mb-1 block">User Name</label>
               <input 
                 type="text" 
                 required 
                 placeholder="LuxuryDecor123" 
                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition" 
                 value={formData.username} 
                 onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
               />
            </div>

            {/* Email */}
            <div>
               <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
               <input 
                 type="email" 
                 required 
                 placeholder="name@example.com" 
                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition" 
                 value={formData.email} 
                 onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
               />
            </div>

            {/* Password */}
            <div>
               <label className="text-sm font-medium text-gray-700 mb-1 block">Mật khẩu</label>
               <input 
                 type="password" 
                 required 
                 placeholder="••••••••" 
                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition" 
                 value={formData.password} 
                 onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
               />
            </div>

            {/* Repeat Password */}
            <div>
               <label className="text-sm font-medium text-gray-700 mb-1 block">Nhập lại mật khẩu</label>
               <input 
                 type="password" 
                 required 
                 placeholder="••••••••" 
                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition" 
                 value={formData.repassword} 
                 onChange={(e) => setFormData({ ...formData, repassword: e.target.value })} 
               />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3.5 rounded-lg hover:bg-gray-800 transition font-bold tracking-wide mt-6 disabled:bg-gray-400 shadow-lg"
            >
              {loading ? "Đang xử lý..." : "Đăng ký ngay"}
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-center mt-8 text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-black font-bold hover:underline ml-1">
              Đăng nhập
            </Link>
          </p>
        </div>

        {/* === CỘT PHẢI: LOGO/BRANDING (Chiếm 50% - Ẩn trên mobile) === */}
        <div className="hidden md:flex w-1/2 relative bg-gray-50 items-center justify-center">
          {/* Logo hiển thị trọn vẹn, có padding để thoáng */}
          <Image
            src="/LogoNiRi1.png" 
            alt="Luxury Decor Banner"
            fill
            className="object-cover" 
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

      </div>
    </div>
  );
}