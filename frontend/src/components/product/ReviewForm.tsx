"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { productService } from "@/services/product.service";
import toast from "react-hot-toast";

interface ReviewFormProps {
    productId: number;
    onReviewSuccess?: () => void; // Gọi lại hàm reload data ở trang chi tiết
}

export default function ReviewForm({ productId, onReviewSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const userStr = localStorage.getItem("user");
        if (!userStr) {
            toast.error("Vui lòng đăng nhập để đánh giá!");
            return;
        }

        if (rating === 0) {
            toast.error("Vui lòng chọn số sao đánh giá!");
            return;
        }

        try {
            setIsSubmitting(true);
            const user = JSON.parse(userStr);
            // Lấy ID chuẩn theo AuthUser
            const accountId = user.userId; 

            await productService.addReview(productId, accountId, rating, comment);
            
            toast.success("Cảm ơn bạn đã đánh giá!");
            setRating(0);
            setComment("");
            if (onReviewSuccess) onReviewSuccess();
            
        } catch (error) {
            toast.error("Đánh giá thất bại. Vui lòng thử lại!");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-2xl mt-8 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Đánh giá sản phẩm này</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Chọn Sao */}
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            type="button"
                            key={star}
                            className="focus:outline-none transition-colors"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                        >
                            <Star
                                size={28}
                                className={`${
                                    star <= (hover || rating)
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-gray-300"
                                } transition-all`}
                            />
                        </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-500 font-medium">
                        {rating > 0 ? `${rating} sao` : "Chọn sao"}
                    </span>
                </div>

                {/* Nhập Comment */}
                <textarea
                    rows={3}
                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này nhé..."
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                ></textarea>

                {/* Nút Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition disabled:bg-gray-400"
                >
                    {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
            </form>
        </div>
    );
}