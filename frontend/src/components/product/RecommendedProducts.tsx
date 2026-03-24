"use client";

import { useEffect, useState } from "react";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product.types";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function RecommendedProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                // 1. Lấy thông tin user hiện tại từ localStorage
                const userStr = localStorage.getItem("user");
                let res: Product[] = [];
                let accountId = null;
                if (userStr) {
                    const user = JSON.parse(userStr);
                    accountId = user?.userId ;
                }
                if (accountId) { 
                    console.log("Đang gọi Lọc cộng tác cho User ID:", accountId);
                    res = await productService.getRecommendations(accountId);
                } else {
                    console.log("Không có userId, chuyển sang gọi Sản phẩm Nổi bật");
                    res = await productService.getFeaturedProducts(); 
                }

                // Cập nhật state (Giới hạn hiển thị 5-8 sản phẩm cho đẹp)
                setProducts(res.slice(0, 8));
            } catch (error) {
                console.error("Lỗi tải gợi ý:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    // Hiển thị khung xương (Skeleton) khi đang tải data
    if (loading) {
        return (
            <div className="py-8">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
                <div className="flex gap-6 overflow-hidden">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-48 h-64 bg-gray-100 rounded-2xl flex-shrink-0 animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <div className="py-8 border-t border-gray-100 mt-8">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="text-amber-500" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">Dành riêng cho bạn</h2>
            </div>

            {/* Thanh trượt vuốt ngang (Horizontal Scroll) */}
            <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {products.map((product) => (
                    <div key={product.productId} className="snap-start flex-shrink-0 w-40 md:w-56 group">
                        <Link href={`/products/${product.productId}`}>
                            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3 border border-gray-100">
                                <Image
                                    src={product.image || "https://placehold.co/400"}
                                    alt={product.productName}
                                    fill
                                    className="object-cover group-hover:scale-110 transition duration-500"
                                />
                                {/* Badge Gợi ý */}
                                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-[10px] uppercase font-bold px-2 py-1 rounded text-amber-600 shadow-sm">
                                    Gợi ý
                                </div>
                            </div>
                            
                            <h3 className="font-medium text-gray-800 line-clamp-2 text-sm mb-1 group-hover:text-blue-600 transition">
                                {product.productName}
                            </h3>
                            
                            <div className="font-bold text-gray-900">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}