"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, KeyRound, Eye, EyeOff } from "lucide-react";
import { AxiosError } from "axios";
import Image from "next/image";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // State quản lý các bước: 1 = Nhập Email, 2 = Nhập OTP & Đổi Pass
  const [step, setStep] = useState(1);
  
  // Data form
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showRePass, setShowRePass] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
      let timer: NodeJS.Timeout;
      if (countdown > 0) {
        timer = setInterval(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
      }
      return () => clearInterval(timer);
  }, [countdown]);

  // --- XỬ LÝ BƯỚC 1: GỬI YÊU CẦU OTP ---
  const handleSendOtp = async (e: React.FormEvent) => {
    if (e) e.preventDefault(); // Check nếu gọi từ form submit
    
    // Nếu đang đếm ngược thì không cho gọi API
    if (countdown > 0) return;

    setError("");
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      
      setCountdown(120); 
      
      if (step === 1) setStep(2); // Nếu đang ở bước 1 thì sang bước 2
      
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || "Lỗi gửi OTP.");
    } finally {
      setLoading(false);
    }
  };

  // --- XỬ LÝ BƯỚC 2: ĐỔI MẬT KHẨU ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== reNewPassword) {
      setError("Mật khẩu nhập lại không khớp!");
      return;
    }

    setLoading(true);
    try {
      // Gọi API reset password (gửi kèm email, otp, password mới)
      await authService.resetPassword({
        email: email,
        otp: otp,
        newPassword: newPassword,
        confirmPassword: reNewPassword
      });
      
      // Thành công -> Chuyển về login
      router.push("/login?reset=success");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      
      {/* CARD WRAPPER */}
      <div className="flex w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[600px]">

        {/* === CỘT TRÁI: LOGO (Giữ nguyên) === */}
        <div className="hidden md:flex w-1/2 relative bg-gray-50 items-center justify-center">
           <Image
             src="/logo-niri-main.png"
             alt="Luxury Decor Logo"
             fill
             className="object-cover"
             priority
           />
        </div>

        {/* === CỘT PHẢI: FORM === */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
          
          {/* Nút quay lại */}
          <Link href="/login" className="absolute top-8 left-8 text-gray-500 hover:text-black transition flex items-center gap-2 text-sm font-medium">
            <ArrowLeft size={16} /> Quay lại
          </Link>

          <div className="mb-8 mt-6">
            <h2 className="text-3xl font-bold text-gray-900 font-serif">
              {step === 1 ? "Quên mật khẩu?" : "Đặt lại mật khẩu"}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              {step === 1 
                ? "Nhập email để nhận mã xác thực (OTP)." 
                : `Mã OTP đã được gửi đến ${email}`
              }
            </p>
          </div>

          {/* Hiển thị lỗi chung */}
          {error && (
            <div className="p-3 mb-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* --- FORM BƯỚC 1: NHẬP EMAIL --- */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
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
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || countdown > 0}
                className={`w-full py-3.5 rounded-lg font-bold transition shadow-lg ${
                  loading || countdown > 0 
                  ? "bg-gray-400 cursor-not-allowed text-white" 
                  : "bg-black hover:bg-gray-800 text-white"
                }`}
              >
                {loading 
                  ? "Đang gửi..." 
                  : countdown > 0 
                    ? `Vui lòng chờ ${countdown}s`  // Hiện số giây
                    : "Tiếp tục"
                }
              </button>
            </form>
          )}

          {/* --- FORM BƯỚC 2: NHẬP OTP & PASSWORD MỚI --- */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã OTP (6 số)</label>
                <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <KeyRound size={18} strokeWidth={2} />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition tracking-widest font-mono text-lg"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              </div>

              {/* Mật khẩu mới */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition pr-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Nhập lại mật khẩu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input
                    type={showRePass ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition pr-10"
                    value={reNewPassword}
                    onChange={(e) => setReNewPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowRePass(!showRePass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showRePass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3.5 rounded-lg hover:bg-gray-800 transition font-bold disabled:bg-gray-400 shadow-lg"
                >
                  {loading ? "Đang đổi mật khẩu..." : "Xác nhận đổi mật khẩu"}
                </button>
                
                {/* Nút gửi lại OTP */}
                <button 
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || countdown > 0}
                  className={`w-full mt-3 text-sm py-2 font-medium ${
                    countdown > 0 ? "text-gray-400" : "text-gray-600 hover:text-black hover:underline"
                  }`}
                >
                  {countdown > 0 
                    ? `Gửi lại mã sau (${countdown}s)` 
                    : "Chưa nhận được mã? Gửi lại"
                  }
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}