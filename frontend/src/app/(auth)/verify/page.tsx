"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import { AxiosError } from "axios";
import Image from "next/image";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authService.verifyAccount(emailFromQuery, otp);
      // Xác thực xong -> Chuyển sang Login
      router.push("/login?verified=true");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || "Mã OTP không chính xác.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="flex w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[500px]">
        {/* CỘT TRÁI: ẢNH */}
        <div className="hidden md:block w-1/2 relative bg-gray-50">
           <Image src="/LogoNiRi1.png" alt="Logo" fill className="object-contain p-12" priority />
        </div>

        {/* CỘT PHẢI: FORM OTP */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <h2 className="text-2xl font-bold mb-2 font-serif">Xác thực tài khoản</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Vui lòng nhập mã OTP đã được gửi đến email <b>{emailFromQuery}</b>
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã OTP</label>
              <input 
                type="text" 
                required 
                placeholder="Nhập 6 số OTP" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none tracking-widest text-center text-lg"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-black text-white py-3.5 rounded-lg hover:bg-gray-800 transition font-bold disabled:bg-gray-400">
              {loading ? "Đang xác thực..." : "Kích hoạt tài khoản"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}