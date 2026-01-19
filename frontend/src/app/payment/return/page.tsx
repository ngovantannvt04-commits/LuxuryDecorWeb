"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { orderService } from "@/services/order.service";
import { VNPayCallbackParams } from "@/types/order.types"; 
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

// Helper chuyển đổi URLSearchParams sang Object chuẩn Interface
const getVNPayParams = (searchParams: URLSearchParams): VNPayCallbackParams => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        params[key] = value;
    });
    return params as unknown as VNPayCallbackParams;
};

function PaymentResult() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

    useEffect(() => {
    
        // Ép kiểu searchParams về URLSearchParams thực thụ để tránh lỗi type của Next.js
        const params = getVNPayParams(searchParams as unknown as URLSearchParams);

        // Nếu không có SecureHash thì không phải callback hợp lệ
        if (!params.vnp_SecureHash) {
            return;
        }

        // Gọi API Backend
        const verifyPayment = async () => {
            try {
                // params giờ đã đúng kiểu VNPayCallbackParams
                const res = await orderService.handlePaymentCallback(params);
                
                if (res.status === "success") {
                    setStatus("success");
                } else {
                    setStatus("failed");
                }
            } catch (error) {
                console.error("Lỗi xác thực thanh toán:", error);
                setStatus("failed");
            }
        };

        verifyPayment();
    }, [searchParams]);

    // Lấy thông tin hiển thị (có thể null nếu url lỗi, cần check optional)
    const orderInfo = searchParams.get("vnp_OrderInfo") || "Đơn hàng";
    const amountStr = searchParams.get("vnp_Amount");
    const amount = amountStr ? Number(amountStr) / 100 : 0; // VNPay nhân 100 nên phải chia lại

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <p className="text-gray-600 font-medium">Đang xác thực giao dịch...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full animate-fade-in">
                {status === "success" ? (
                    <>
                        <div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="text-green-600 w-12 h-12" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h2>
                        <p className="text-gray-500 mb-6">
                            {orderInfo}<br/>
                            Số tiền: <span className="font-bold text-gray-800">{amount.toLocaleString('vi-VN')} đ</span><br/>
                            đã được hệ thống ghi nhận.
                        </p>
                        <button 
                            onClick={() => router.push("/orders")} 
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 w-full font-medium transition"
                        >
                            Xem lịch sử đơn hàng
                        </button>
                    </>
                ) : (
                    <>
                         <div className="mx-auto bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="text-red-600 w-12 h-12" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Giao dịch thất bại</h2>
                        <p className="text-gray-500 mb-6">
                            Có lỗi xảy ra trong quá trình xử lý hoặc chữ ký bảo mật không hợp lệ. Vui lòng kiểm tra lại.
                        </p>
                        <button 
                            onClick={() => router.push("/cart")}
                            className="bg-gray-100 text-gray-800 px-6 py-2.5 rounded-lg hover:bg-gray-200 w-full font-medium transition"
                        >
                            Quay lại giỏ hàng
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function PaymentReturnPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
            <PaymentResult />
        </Suspense>
    );
}