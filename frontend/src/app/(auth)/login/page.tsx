"use client"; 

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { AxiosError } from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authService.login(formData);
      // Lưu token (authService đã check window để dùng sessionStorage rồi)
      authService.setSession(res.token, res.refreshToken);
      
      alert("Đăng nhập thành công!");
      router.push("/"); // Chuyển về trang chủ
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Luxury Decor</h2>
          <p className="text-gray-500 mt-2">Chào mừng bạn quay trở lại</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <Mail size={20} />
              </span>
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <Lock size={20} />
              </span>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2.5 rounded-lg hover:bg-gray-800 transition font-medium disabled:bg-gray-400"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-blue-600 font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}