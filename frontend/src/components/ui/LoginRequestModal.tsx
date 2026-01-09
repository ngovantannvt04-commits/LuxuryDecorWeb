"use client";
import { X, LogIn } from "lucide-react";
import Link from "next/link";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginRequestModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative transform transition-all scale-100 min-h-[420px]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <X size={20} />
        </button>

        <div className="w-full text-center space-y-5">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <LogIn size={36} />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-5">Vui lòng đăng nhập</h3>
          <p className="text-gray-500 mb-6 text-sm">
            Bạn cần đăng nhập tài khoản thành viên để thực hiện thêm sản phẩm vào giỏ hàng.
          </p>

          <div className="space-y-4 pt-6">
            <Link 
              href="/login"
              onClick={onClose} 
              className="block w-full bg-black text-white py-3 mb-5 rounded-full font-bold hover:bg-gray-800 transition"
            >
              Đăng nhập ngay
            </Link>
            <button 
              onClick={onClose}
              className="block w-full bg-gray-100 text-gray-700 py-3 rounded-full font-bold hover:bg-gray-200 transition"
            >
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}