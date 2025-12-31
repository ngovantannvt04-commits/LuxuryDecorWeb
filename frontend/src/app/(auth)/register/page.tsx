"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import Link from "next/link";
import { AxiosError } from "axios";

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

    // Validate khớp mật khẩu (Frontend check trước cho nhanh)
    if (formData.password !== formData.repassword) {
      setError("Mật khẩu nhập lại không khớp!");
      return;
    }

    setLoading(true);

    try {
      await authService.register(formData);
      alert("Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.");
      // Chuyển hướng sang trang Login (hoặc trang nhập OTP nếu bạn làm tiếp)
      router.push("/login");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>; // 3. ÉP KIỂU
      setError(err.response?.data?.message || "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Tạo tài khoản</h2>
          <p className="text-gray-500 mt-2">Gia nhập Luxury Decor ngay hôm nay</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
            <input
              type="text"
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {/* Re-Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nhập lại mật khẩu</label>
            <input
              type="password"
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
              value={formData.repassword}
              onChange={(e) => setFormData({ ...formData, repassword: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2.5 rounded-lg hover:bg-gray-800 transition font-medium mt-4 disabled:bg-gray-400"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}