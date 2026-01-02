"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { AxiosError } from "axios";
import Image from "next/image";
import { authService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true); // Hiển thị thông báo thành công
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      
      {/* CARD WRAPPER */}
      <div className="flex w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[600px]">

        {/* === CỘT TRÁI: LOGO === */}
        <div className="hidden md:block w-1/2 relative bg-gray-100">
           <Image
             src="/LogoNiRi1.png"
             alt="Luxury Decor Logo"
             fill
             className="object-cover"
             priority
           />
        </div>

        {/* === CỘT PHẢI: FORM === */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
          
          {/* Nút quay lại góc trên cùng */}
          <Link href="/login" className="absolute top-6 left-6 text-gray-500 hover:text-black transition flex items-center gap-2 text-sm font-medium">
            <ArrowLeft size={16} /> Quay lại
          </Link>

          <div className="mb-8 mt-4 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 font-serif">Quên mật khẩu?</h2>
            <p className="text-gray-500 mt-2">
              Đừng lo, hãy nhập email đăng ký của bạn. Chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.
            </p>
          </div>

          {/* Nếu gửi thành công thì hiện thông báo, ẩn form đi cho gọn */}
          {success ? (
            <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center animate-fade-in">
              <div className="flex justify-center mb-4">
                <CheckCircle className="text-green-500 w-12 h-12" />
              </div>
              <h3 className="text-green-800 font-bold text-lg mb-2">Đã gửi email!</h3>
              <p className="text-green-700 text-sm mb-6">
                Vui lòng kiểm tra hộp thư đến (và cả mục Spam) của <b>{email}</b> để lấy lại mật khẩu.
              </p>
              <button 
                onClick={() => setSuccess(false)} // Cho phép gửi lại nếu nhập sai email
                className="text-sm text-green-600 hover:underline font-medium"
              >
                Gửi lại cho email khác
              </button>
            </div>
          ) : (
            /* FORM NHẬP EMAIL */
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email đăng ký</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={18} strokeWidth={2} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:bg-white focus:border-transparent transition outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3.5 rounded-lg hover:bg-gray-800 transition duration-300 font-bold tracking-wide shadow-lg disabled:bg-gray-400"
              >
                {loading ? "Gửi yêu cầu..." : "Gửi email khôi phục"}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}