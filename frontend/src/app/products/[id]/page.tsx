"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product.types";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Check } from "lucide-react"; // Cần cài lucide-react nếu chưa có

export default function ProductDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State số lượng mua
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("Không tìm thấy sản phẩm", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // === LOGIC XỬ LÝ SỐ LƯỢNG ===
  
  // 1. Giảm số lượng
  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // 2. Tăng số lượng (Check tồn kho)
  const handleIncrease = () => {
    if (product && quantity < product.stockQuantity) {
      setQuantity(quantity + 1);
    }
  };

  // 3. Nhập trực tiếp vào ô input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ cho phép nhập số
    const val = e.target.value.replace(/[^0-9]/g, "");
    
    if (val === "") {
        setQuantity(0); // Tạm thời để 0 để user xóa hết số được
        return;
    }

    let num = parseInt(val);
    
    if (product) {
        // Nếu nhập quá kho -> Set bằng kho
        if (num > product.stockQuantity) num = product.stockQuantity;
    }
    setQuantity(num);
  };

  // 4. Xử lý khi user click ra ngoài ô input (Blur)
  const handleBlur = () => {
    // Nếu để trống hoặc bằng 0 -> Reset về 1
    if (quantity <= 0) {
        setQuantity(1);
    }
  };

  // === XỬ LÝ MUA HÀNG ===
  const handleAddToCart = () => {
    alert(`Đã thêm ${quantity} sản phẩm "${product?.productName}" vào giỏ!`);
    // Sau này gọi API CartService ở đây
  };

  const handleBuyNow = () => {
    alert(`Chuyển sang trang thanh toán với ${quantity} sản phẩm!`);
    // Router.push('/checkout')
  };

  const formatCurrency = (amount: number) => 
     new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Sản phẩm không tồn tại</div>;

  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div className="bg-white min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb đơn giản */}
        <div className="text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-black hover:underline transition">
                Trang chủ
            </Link>
            
            <span>/</span>

            {/* 2. Link về trang Danh sách (có lọc theo Category) */}
            {/* Lưu ý: Bạn cần đảm bảo object 'product' có trường 'categoryId' */}
            <Link 
                href={`/products?categoryId=${encodeURIComponent(product.categoryName)}`} 
                className="hover:text-black hover:underline transition"
            >
                {product.categoryName}
            </Link>

            <span>/</span>

            {/* 3. Trang hiện tại (Không cần link) */}
            <span className="text-black font-medium truncate max-w-[200px] sm:max-w-md">
                {product.productName}
            </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* CỘT TRÁI: ẢNH SẢN PHẨM */}
            <div className="relative h-[400px] md:h-[600px] bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
                <Image 
                    src={product.image || "https://placehold.co/600x600"} 
                    alt={product.productName} 
                    fill 
                    className="object-cover"
                />
            </div>

            {/* CỘT PHẢI: THÔNG TIN */}
            <div className="space-y-6">

                <div className="text-sm text-gray-400 font-medium tracking-wide">
                    MÃ SP: #{product.productId}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight text-justify">
                    {product.productName}
                </h1>

                <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-amber-700">
                        {formatCurrency(product.price)}
                    </span>
                    <div className="h-5 w-[1px] bg-gray-300"></div>
                    <span className="text-sm text-gray-500">
                        Đã bán: <span className="text-black font-semibold">{product.quantitySold}</span>
                    </span>
                    {/* Tag tình trạng hàng */}
                    {isOutOfStock ? (
                         <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">Hết hàng</span>
                    ) : (
                         <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            <Check size={14}/> Còn hàng
                         </span>
                    )}
                </div>

                <div className="border-t border-b border-gray-200 py-6">
                    <h3 className="font-bold text-gray-900 mb-2">Mô tả sản phẩm:</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {product.description || "Đang cập nhật mô tả..."}
                    </p>
                </div>

                {/* SELECT SỐ LƯỢNG */}
                <div className="flex items-center gap-6">
                    <span className="font-bold text-gray-700">Số lượng:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                        <button 
                            onClick={handleDecrease}
                            disabled={isOutOfStock || quantity <= 1}
                            className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Minus size={16}/>
                        </button>
                        
                        <input 
                            type="text" 
                            className="w-14 text-center focus:outline-none font-medium"
                            value={quantity}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            disabled={isOutOfStock}
                        />

                        <button 
                            onClick={handleIncrease}
                            disabled={isOutOfStock || quantity >= product.stockQuantity}
                            className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={16}/>
                        </button>
                    </div>
                    <span className="text-sm text-gray-500">
                        {product.stockQuantity} sản phẩm có sẵn
                    </span>
                </div>

                {/* BUTTONS ACTION */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button 
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className="flex-1 bg-white border-2 border-black text-black py-4 rounded-full font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShoppingCart size={20}/> Thêm vào giỏ
                    </button>
                    
                    <button 
                        onClick={handleBuyNow}
                        disabled={isOutOfStock}
                        className="flex-1 bg-black text-white border-2 border-black py-4 rounded-full font-bold hover:bg-gray-800 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Mua ngay
                    </button>
                </div>
                
                {/* Chính sách đảm bảo */}
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mt-6 pt-6 border-t border-gray-100">
                     <div className="flex items-center gap-2">
                        <Image src="/icons/authentic.svg" width={20} height={20} alt="" className="opacity-60"/>
                        <span>Cam kết chính hãng 100%</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Image src="/icons/shipping.svg" width={20} height={20} alt="" className="opacity-60"/>
                        <span>Miễn phí vận chuyển toàn quốc</span>
                     </div>
                </div>
            </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}