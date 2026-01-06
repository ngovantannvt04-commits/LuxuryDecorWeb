"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product.types";
import { useCart } from "@/context/CartContext";

// Helper format tiền tệ
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Lấy 8 sản phẩm mới nhất
        const data = await productService.getFeaturedProducts();
        setProducts(data);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-white">
      <Header />

      {/* Hero Section (Giữ nguyên) */}
      <section className="relative h-[600px] flex items-center justify-center bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-50">
             <Image src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000" alt="Hero" fill className="object-cover" priority/>
        </div>
        <div className="relative z-10 text-center max-w-4xl px-4">
             <h1 className="text-5xl md:text-7xl font-bold font-serif mb-6 tracking-wide">NIRI LUXURY DECOR</h1>
             <p className="text-xl md:text-2xl text-gray-200 mb-8 font-light">Kiến tạo không gian sống đẳng cấp thượng lưu.</p>
             <Link href="/products" className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-200 transition duration-300">
                Khám phá bộ sưu tập
             </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 mb-4">
                Bộ Sưu Tập Nổi Bật
            </h2>
            <p className="text-gray-500">
                Đại diện tinh hoa từ từng dòng sản phẩm
            </p>
        </div>

        {loading ? (
           <div className="text-center py-10">Đang tải sản phẩm...</div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {products.map((product) => (
                   <Link 
                      key={product.productId} 
                      href={`/products/${product.productId}`} // Đường dẫn đến trang detail
                      className="group cursor-pointer block" // Thêm block để thẻ a bao phủ tốt hơn
                  >
                      <div className="relative h-80 w-full overflow-hidden rounded-xl bg-gray-100 mb-4 border border-gray-100">
                          {product.image ? (
                              <Image 
                                  src={product.image} 
                                  alt={product.productName} 
                                  fill 
                                  className="object-cover group-hover:scale-105 transition duration-500" 
                              />
                          ) : (
                              <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                          )}
                          
                          {/* Nút thêm nhanh */}
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                              {/* 👇 3. Xử lý nút button để không bị nhảy trang */}
                              <button 
                                  onClick={(e) => {
                                      e.preventDefault(); // Chặn hành vi chuyển trang của Link
                                      addToCart(product, 1); 
                                      alert("Đã thêm vào giỏ!");
                                      console.log("Thêm vào giỏ:", product.productId);
                                  }}
                                  className="bg-white text-black px-6 py-2 rounded-full font-bold shadow-lg text-sm hover:bg-black hover:text-white transition z-10"
                              >
                                  Thêm vào giỏ
                              </button>
                          </div>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-amber-600 transition truncate">
                          {product.productName}
                      </h3>
                      <div className="flex justify-between items-center mt-1">
                          <p className="text-gray-600 font-medium">{formatCurrency(product.price)}</p>
                          <span className="text-xs text-gray-400">Đã bán: {product.quantitySold}</span>
                      </div>
                  </Link>
                ))}
            </div>
        )}

        <div className="text-center mt-12">
            <Link href="/products" className="inline-block border-b-2 border-black pb-1 font-bold hover:text-gray-600 hover:border-gray-600 transition">
                Xem tất cả sản phẩm &rarr;
            </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}