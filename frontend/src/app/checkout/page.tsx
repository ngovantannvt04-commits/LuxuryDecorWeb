"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import { useCart } from "@/context/CartContext";
import { orderService } from "@/services/order.service";
import { authService } from "@/services/auth.service";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { PlaceOrderRequest } from "@/types/order.types";
import { CreditCard, MapPin, Phone, User, Loader2 } from "lucide-react";
import Image from "next/image";
import { AxiosError } from "axios";
import { userService } from "@/services/user.service";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartItems, fetchCart, loading: cartLoading } = useCart(); 
  const isSuccessRef = useRef(false);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PlaceOrderRequest>({
    fullName: "",
    phoneNumber: "",
    address: "",
    note: "",
    paymentMethod: "COD",
    selectedProductIds: [] 
  });

  // Lọc sản phẩm cần thanh toán từ URL
  const checkoutItems = useMemo(() => {
      const itemsParam = searchParams.get('items'); 
      if (!itemsParam) return []; // Nếu không có param -> Không hiện gì (hoặc redirect)
      
      const ids = itemsParam.split(',').map(Number); // [101, 102]
      // Lọc giỏ hàng chỉ lấy những món trùng ID
      return cartItems.filter(item => ids.includes(item.productId));
  }, [cartItems, searchParams]);

  // Tính lại tổng tiền CHỈ CHO CÁC MÓN ĐƯỢC CHỌN
  const checkoutTotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Tự động điền thông tin User
  useEffect(() => {
    const loadUserInfo = async () => {
      const user = await authService.getUser();
      const userData = await userService.getMyProfile();
      if (user) {
        setFormData(prev => ({
          ...prev,
          fullName: user.username || "",
          phoneNumber: userData.phoneNumber || "",
          address: userData.address || "" 
        }));
      } else {
        router.push("/login?redirect=/checkout");
      }
    };
    loadUserInfo();
  }, [router]);

  // Logic bảo vệ: load xong mà không có item nào để thanh toán thì về giỏ hàng
  useEffect(() => {
    if (isSuccessRef.current) return;
    if (!cartLoading && checkoutItems.length === 0) {
      router.push("/cart"); 
    }
  }, [checkoutItems, cartLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.address || !formData.phoneNumber || !formData.fullName) {
        alert("Vui lòng điền đầy đủ thông tin giao hàng.");
        return;
    }

    setLoading(true);
    try {
        // Chuẩn bị payload gửi lên server
        const payload: PlaceOrderRequest = {
            ...formData,
            // Gửi danh sách ID các món đang hiển thị ở trang checkout
            selectedProductIds: checkoutItems.map(item => item.productId)
        };

        // Gọi API Đặt hàng
        const res = await orderService.placeOrder(payload);
        isSuccessRef.current = true;
        await fetchCart(); 
        
        if (formData.paymentMethod === "VNPAY") {
            // === XỬ LÝ VNPAY ===
            // Gọi API lấy link thanh toán
            const paymentUrl = await orderService.createPaymentUrl(
                checkoutTotal, // Tổng tiền
                `ThanhToanDonHang${res.orderId}`, // Nội dung chuyển khoản
                res.orderId
            );
            
            // Chuyển hướng sang VNPay
            window.location.href = paymentUrl;
        } else {
            // === XỬ LÝ COD ===
            alert("Đặt hàng thành công!");
            router.push(`/orders/${res.orderId}`);
        }
        
    } catch (error) { 
        console.error(error);
        const err = error as AxiosError<{ message: string }>;
        const errorMsg = err.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại sau.";
        alert(errorMsg);
        setLoading(false);
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
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none" 
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
                        
                        {/* VNPAY */}
                        <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${formData.paymentMethod === "VNPAY" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                            <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="VNPAY" 
                                checked={formData.paymentMethod === "VNPAY"}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-black focus:ring-black" 
                            />
                            <div className="flex-1 flex items-center gap-2">
                                <span className="font-bold">VNPAY / Banking</span>
                                <Image src="/vnpay-logo.png" width={40} height={15} alt="VNPAY" className="object-contain h-6 w-auto" onError={(e) => e.currentTarget.style.display = 'none'} />
                            </div>
                            <span className="text-sm text-blue-600 font-medium">Thanh toán ngay</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (Dùng biến checkoutItems thay vì cartItems) */}
            <div className="lg:col-span-5">
                <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24 border border-gray-100">
                    <h3 className="text-lg font-bold mb-6">Đơn hàng của bạn ({checkoutItems.length} sản phẩm)</h3>
                    
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2 mb-6 scrollbar-thin">
                        {checkoutItems.map((item) => (
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
                            <span>{formatCurrency(checkoutTotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Phí vận chuyển</span>
                            <span className="text-green-600 font-medium">Miễn phí</span>
                        </div>
                        <div className="border-t border-dashed border-gray-200 my-2"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold">Tổng cộng</span>
                            {/* Dùng checkoutTotal */}
                            <span className="text-2xl font-bold text-amber-700">{formatCurrency(checkoutTotal)}</span>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full mt-6 bg-black text-white py-4 rounded-full font-bold hover:bg-gray-800 transition shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-400"
                    >
                        {loading ? <Loader2 className="animate-spin"/> : (formData.paymentMethod === "VNPAY" ? "Thanh toán VNPAY" : "Đặt hàng ngay")}
                    </button>
                    
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Nhấn &ldquo;{formData.paymentMethod === "VNPAY" ? "Thanh toán VNPAY" : "Đặt hàng ngay"}&rdquo; đồng nghĩa với việc bạn đồng ý với điều khoản dịch vụ của NIRI.
                    </p>
                </div>
            </div>

        </form>
      </main>
      <Footer />
    </div>
  );
}