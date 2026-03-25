"use client";

import { useEffect, useState } from "react";
import { Star, User } from "lucide-react";
import ReviewForm from "./ReviewForm"; 
import { productService } from "@/services/product.service"; 
import { orderService } from "@/services/order.service"; 

interface ReviewResponse {
    reviewId: number;
    accountName: string; // Tên user để hiển thị
    rating: number;
    comment: string;
    createdAt: string;
}

export default function ProductReviews({ productId }: { productId: number }) {
    const [reviews, setReviews] = useState<ReviewResponse[]>([]);
    const [canReview, setCanReview] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchReviewData = async () => {
        try {
            // 1. Gọi API lấy danh sách các đánh giá cũ của sản phẩm này
            const fetchedReviews = await productService.getProductReviews(productId);
            setReviews(fetchedReviews);

            // 2. Kiểm tra xem User hiện tại có được phép đánh giá không
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                const accountId = user.userId;
                
                // Gọi API sang Order Service để check xem đã mua chưa
                const hasPurchased = await orderService.checkPurchased(accountId, productId);
                
                // Đã mua VÀ chưa từng đánh giá sản phẩm này thì mới cho hiện Form
                const hasReviewed = fetchedReviews.some(r => r.accountName === user.username); // Hoặc check bằng ID
                
                setCanReview(hasPurchased && !hasReviewed);
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu đánh giá:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviewData();
    }, [productId]);

    // Tính số sao trung bình
    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : 0;

    if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl mt-8"></div>;

    return (
        <div className="mt-12 border-t border-gray-100 pt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Đánh giá sản phẩm</h2>

            {/* Thống kê Tổng quan */}
            <div className="flex items-center gap-6 mb-8 bg-amber-50 p-6 rounded-2xl">
                <div className="text-center">
                    <div className="text-5xl font-bold text-amber-500">{averageRating}</div>
                    <div className="flex text-amber-400 my-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={20} className={star <= Number(averageRating) ? "fill-amber-400" : "text-gray-300"} />
                        ))}
                    </div>
                    <div className="text-sm text-gray-500">{reviews.length} đánh giá</div>
                </div>
                {/* Bạn có thể làm thêm thanh tiến trình 5 sao, 4 sao ở đây nếu muốn */}
            </div>

            {/* Danh sách bình luận của những người ĐÃ MUA */}
            <div className="space-y-6 mb-8">
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review.reviewId} className="border-b border-gray-100 pb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User size={20} className="text-gray-500" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-800 text-sm">{review.accountName}</div>
                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} className={i < review.rating ? "fill-amber-400" : "text-gray-300"} />
                                        ))}
                                    </div>
                                </div>
                                <div className="ml-auto text-xs text-gray-400">
                                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm mt-2">{review.comment}</p>
                            <div className="text-xs text-green-600 flex items-center gap-1 mt-2 font-medium">
                                ✓ Đã mua hàng
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 italic text-center py-4">Chưa có đánh giá nào cho sản phẩm này.</p>
                )}
            </div>

            {/* Form đánh giá (CHỈ HIỆN KHI ĐÃ MUA HÀNG VÀ CHƯA ĐÁNH GIÁ) */}
            {canReview ? (
                <ReviewForm productId={productId} onReviewSuccess={fetchReviewData} />
            ) : (
                <div className="bg-gray-50 p-4 rounded-xl text-center text-sm text-gray-500">
                    Bạn chỉ có thể đánh giá sau khi đã mua sản phẩm này.
                </div>
            )}
        </div>
    );
}