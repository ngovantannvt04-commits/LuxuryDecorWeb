"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  
  // Dữ liệu sản phẩm giả lập
  const products = [
    { id: 1, name: "Ghế Sofa Luxury Velvet", price: "12,500,000đ", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80" },
    { id: 2, name: "Đèn Chùm Pha Lê", price: "8,900,000đ", image: "https://www.indoorgarden.vn/wp-content/uploads/2023/02/den-ngu-bac-au-gom-su-dep.jpg" },
    { id: 3, name: "Bàn Trà Mặt Đá", price: "5,200,000đ", image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=500&q=80" },
    { id: 4, name: "Giường Ngủ Hoàng Gia", price: "25,000,000đ", image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=500&q=80" },
  ];

  return (
    <div className="bg-white">
      {/* 1. Header (Navbar) */}
      <Header />

      {/* 2. Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-gray-900 text-white overflow-hidden">
        {/* Ảnh nền mờ */}
        <div className="absolute inset-0 opacity-50">
             <Image 
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000" 
                alt="Hero Background" 
                fill 
                className="object-cover"
                priority
             />
        </div>
        <div className="relative z-10 text-center max-w-4xl px-4">
             <h1 className="text-5xl md:text-7xl font-bold font-serif mb-6 tracking-wide">NIRI LUXURY DECOR</h1>
             <p className="text-xl md:text-2xl text-gray-200 mb-8 font-light">Kiến tạo không gian sống đẳng cấp thượng lưu.</p>
             <Link href="/products" className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-200 transition duration-300">
                Khám phá bộ sưu tập
             </Link>
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 mb-4">Sản Phẩm Nổi Bật</h2>
            <p className="text-gray-500">Tuyển chọn những thiết kế độc bản dành cho bạn</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {products.map((product) => (
                <div key={product.id} className="group cursor-pointer">
                    <div className="relative h-80 w-full overflow-hidden rounded-xl bg-gray-100 mb-4">
                        <Image 
                            src={product.image} 
                            alt={product.name} 
                            fill 
                            className="object-cover group-hover:scale-105 transition duration-500" 
                        />
                        {/* Nút thêm nhanh */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                             <button className="bg-white text-black px-6 py-2 rounded-full font-bold shadow-lg text-sm hover:bg-black hover:text-white">
                                Thêm vào giỏ
                             </button>
                        </div>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-amber-600 transition">{product.name}</h3>
                    <p className="text-gray-500 mt-1">{product.price}</p>
                </div>
            ))}
        </div>

        <div className="text-center mt-12">
            <Link href="/products" className="inline-block border-b-2 border-black pb-1 font-bold hover:text-gray-600 hover:border-gray-600 transition">
                Xem tất cả sản phẩm &rarr;
            </Link>
        </div>
      </section>

      {/* 4. Footer */}
      <Footer />
    </div>
  );
}