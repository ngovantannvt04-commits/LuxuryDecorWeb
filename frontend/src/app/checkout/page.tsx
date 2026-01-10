"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { orderService } from "@/services/order.service";
import { authService } from "@/services/auth.service";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { PlaceOrderRequest } from "@/types/order.types";
import { CreditCard, MapPin, Phone, User, Loader2 } from "lucide-react";
import Image from "next/image";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, totalPrice, clearCart, loading: cartLoading } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PlaceOrderRequest>({
    fullName: "",
    phoneNumber: "",
    address: "",
    note: "",
    paymentMethod: "COD" // Mặc định
  });

  // 1. Tự động điền thông tin User (nếu có)
  useEffect(() => {
    const loadUserInfo = async () => {
      const user = await authService.getUser();
      if (user) {
        setFormData(prev => ({
          ...prev,
          fullName: user.username || "", // Hoặc user.fullName nếu backend có trả về
          // Nếu có lưu sđt/địa chỉ trong user profile thì điền vào đây luôn
        }));
      } else {
        // Nếu chưa login mà vào checkout -> Đá về login
        router.push("/login?redirect=/checkout");
      }
    };
    loadUserInfo();
  }, [router]);

  // 2. Nếu giỏ hàng trống -> Đá về trang chủ
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      router.push("/products");
    }
  }, [cartItems, cartLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate cơ bản
    if (!formData.address || !formData.phoneNumber || !formData.fullName) {
        alert("Vui lòng điền đầy đủ thông tin giao hàng.");
        return;
    }

    setLoading(true);
    try {
        // Gọi API Đặt hàng
        const res = await orderService.placeOrder(formData);
        
        // Thành công:
        // 1. Xóa giỏ hàng trên UI (Frontend state)
        // (Lưu ý: Backend đã tự xóa trong DB rồi, nhưng Frontend cần cập nhật lại số lượng trên Header)
        clearCart(); 
        
        alert("Đặt hàng thành công!");
        
        // 2. Chuyển hướng đến trang chi tiết đơn hàng vừa tạo
        router.push(`/orders/${res.orderId}`);
        
    } catch (error) {
        console.error(error);
        alert("Đặt hàng thất bại. Vui lòng thử lại sau.");
    } finally {
        setLoading(false);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  if (cartLoading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif font-bold mb-8 text-center">Thanh toán & Đặt hàng</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* CỘT TRÁI: FORM THÔNG TIN */}
            <div className="lg:col-span-7 space-y-6">
                
                {/* Thông tin giao hàng */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <MapPin className="text-amber-700"/> Thông tin giao hàng
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên người nhận</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-3 text-gray-400"/>
                                <input 
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    type="text" 
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none" 
                                    placeholder="Nguyễn Văn A"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-3 top-3 text-gray-400"/>
                                <input 
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    type="tel" 
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none" 
                                    placeholder="0912xxxxxx"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ nhận hàng</label>
                            <textarea 
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none" 
                                placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                                required
                            ></textarea>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (Tùy chọn)</label>
                            <input 
                                name="note"
                                value={formData.note}
                                onChange={handleInputChange}
                                type="text"
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none" 
                                placeholder="Ví dụ: Giao hàng giờ hành chính..."
                            />
                        </div>
                    </div>
                </div>

                {/* Phương thức thanh toán */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <CreditCard className="text-amber-700"/> Phương thức thanh toán
                    </h3>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition border-amber-500 bg-amber-50">
                            <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="COD" 
                                checked={formData.paymentMethod === "COD"}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-black focus:ring-black" 
                            />
                            <span className="font-bold flex-1">Thanh toán khi nhận hàng (COD)</span>
                            <span className="text-sm text-gray-500">Tiền mặt</span>
                        </label>
                        
                        <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition opacity-60">
                            <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="VNPAY" 
                                disabled
                                className="w-5 h-5 text-black focus:ring-black" 
                            />
                            <span className="font-bold flex-1">VNPAY / Banking</span>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">Sắp ra mắt</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
            <div className="lg:col-span-5">
                <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24 border border-gray-100">
                    <h3 className="text-lg font-bold mb-6">Đơn hàng của bạn ({cartItems.length} sản phẩm)</h3>
                    
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2 mb-6 scrollbar-thin">
                        {cartItems.map((item) => (
                            <div key={item.productId} className="flex gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded border overflow-hidden flex-shrink-0 relative">
                                    <Image src={item.image || "https://placehold.co/100"} alt={item.productName} fill className="object-cover"/>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm line-clamp-2">{item.productName}</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                                        <p className="font-bold text-sm">{formatCurrency(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 pt-4 space-y-2">
                         <div className="flex justify-between text-gray-600">
                            <span>Tạm tính</span>
                            <span>{formatCurrency(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Phí vận chuyển</span>
                            <span className="text-green-600 font-medium">Miễn phí</span>
                        </div>
                        <div className="border-t border-dashed border-gray-200 my-2"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold">Tổng cộng</span>
                            <span className="text-2xl font-bold text-amber-700">{formatCurrency(totalPrice)}</span>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full mt-6 bg-black text-white py-4 rounded-full font-bold hover:bg-gray-800 transition shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-400"
                    >
                        {loading ? <Loader2 className="animate-spin"/> : "Đặt hàng ngay"}
                    </button>
                    
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Nhấn &ldquo;Đặt hàng ngay&rdquo; đồng nghĩa với việc bạn đồng ý với điều khoản dịch vụ của NIRI.
                    </p>
                </div>
            </div>

        </form>
      </main>
      <Footer />
    </div>
  );
}