"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowLeft, CreditCard } from "lucide-react";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-serif font-bold mb-8">Giỏ hàng của bạn</h1>

        {cartItems.length === 0 ? (
          // === TRẠNG THÁI GIỎ HÀNG TRỐNG ===
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <Trash2 size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Giỏ hàng đang trống</h2>
            <p className="text-gray-500 mb-8">Hãy chọn những món đồ nội thất ưng ý để trang trí cho tổ ấm nhé.</p>
            <Link href="/products" className="inline-block bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition">
                Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          // === CÓ SẢN PHẨM ===
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-center">
                  
                  {/* Ảnh */}
                  <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                    <Image src={item.image || "https://placehold.co/200x200"} alt={item.productName} fill className="object-cover" />
                  </div>

                  {/* Thông tin */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 line-clamp-2">{item.productName}</h3>
                        <button 
                            onClick={() => removeFromCart(item.productId)}
                            className="text-gray-400 hover:text-red-500 transition p-1"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{formatCurrency(item.price)}</p>

                    <div className="flex items-center justify-between">
                         {/* Bộ chọn số lượng */}
                         <div className="flex items-center border border-gray-200 rounded-lg h-9">
                            <button 
                                onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                className="px-3 hover:bg-gray-50 h-full"
                            >
                                <Minus size={14} />
                            </button>
                            <input 
                                type="number" 
                                min="1"
                                max={item.stockQuantity}
                                className="w-12 h-full text-center text-sm font-medium focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={item.quantity}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    // Cho phép xóa trắng tạm thời để gõ số mới
                                    if (val === '') return; 
                                    
                                    const num = parseInt(val);
                                    // Chỉ cập nhật nếu là số hợp lệ và <= tồn kho
                                    if (!isNaN(num) && num > 0) {
                                        // Nếu nhập quá kho thì lấy max kho, không thì lấy số nhập
                                        const finalNum = Math.min(num, item.stockQuantity);
                                        updateQuantity(item.productId, finalNum);
                                    }
                                }}
                                onBlur={(e) => {
                                    // Khi click ra ngoài, nếu ô trống hoặc số 0 thì reset về 1
                                    const val = parseInt(e.target.value);
                                    if (isNaN(val) || val < 1) {
                                        updateQuantity(item.productId, 1);
                                    }
                                }}
                            />
                            <button 
                                onClick={() => updateQuantity(item.productId, Math.min(item.stockQuantity, item.quantity + 1))}
                                className="px-3 hover:bg-gray-50 h-full"
                            >
                                <Plus size={14} />
                            </button>
                         </div>
                         
                         {/* Tổng tiền item */}
                         <p className="font-bold text-amber-700">
                            {formatCurrency(item.price * item.quantity)}
                         </p>
                    </div>
                  </div>
                </div>
              ))}
              
              <Link href="/products" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black font-medium mt-4">
                 <ArrowLeft size={16} /> Tiếp tục mua sắm
              </Link>
            </div>

            {/* CỘT PHẢI: TỔNG KẾT ĐƠN HÀNG */}
            <div className="lg:col-span-1 h-fit bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-lg font-bold mb-6">Tóm tắt đơn hàng</h3>
                
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                        <span>Tạm tính</span>
                        <span>{formatCurrency(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Phí vận chuyển</span>
                        <span className="text-green-600 font-medium">Miễn phí</span>
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                        <span className="font-bold text-gray-900 text-lg">Tổng cộng</span>
                        <span className="font-bold text-amber-700 text-xl">{formatCurrency(totalPrice)}</span>
                    </div>
                </div>

                <Link href="/checkout" className="block w-full">
                    <button className="w-full bg-black text-white py-4 rounded-full font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-lg">
                        <CreditCard size={18} /> Tiến hành thanh toán
                    </button>
                </Link>

                <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    Bảo mật thanh toán 100%
                </p>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}