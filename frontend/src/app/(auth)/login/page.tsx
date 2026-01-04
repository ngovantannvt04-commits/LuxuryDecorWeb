"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { AxiosError } from "axios";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authService.login(formData);
      const userToSave = {
        id: res.id,
        username: res.username,
        email: res.email,
        role: res.role,
        avatar: null 
      };
      authService.setSession(res.token, res.refreshToken, userToSave);
      if (res.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. CONTAINER CHÍNH
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

      {/* 2. CARD WRAPPER: To hơn (max-w-6xl) và Cao hơn (min-h-[600px]) */}
      <div className="flex w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[600px]">

        <div className="hidden md:block w-1/2 relative bg-gray-50">
           {/* Ảnh tràn viền */}
           <Image
             src="/LogoNiRi1.png"
             alt="Luxury Decor Logo"
             fill
             className="object-cover" // Cắt ảnh vừa khung, không bị méo
             priority
             sizes="(max-width: 768px) 100vw, 50vw"
           />
           {/* (Tuỳ chọn) Lớp phủ tối nhẹ để làm dịu mắt nếu ảnh nền trắng quá */}
           {/* <div className="absolute inset-0 bg-black/5"></div> */}
        </div>

        {/* === CỘT PHẢI: FORM (Chiếm 50% chiều rộng) === */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 font-serif">Luxury Decor</h2>
            <p className="text-gray-500 mt-2">Đăng nhập để quản lý không gian sống</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Input Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} strokeWidth={2} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:bg-white focus:border-transparent transition outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} strokeWidth={2} />
                </span>
                <input
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:bg-white focus:border-transparent transition outline-none"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                   type="button" // Bắt buộc phải là type="button" để không submit form
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition"
                 >
                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                 </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link href="/forgot-password" className="text-sm font-medium text-amber-600 hover:text-amber-700 hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            {/* Nút Đăng nhập */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3.5 rounded-lg hover:bg-gray-800 transition duration-300 font-bold tracking-wide shadow-lg disabled:bg-gray-400 mt-2"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center mt-8 text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-black font-bold hover:underline ml-1">
              Đăng ký ngay
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}