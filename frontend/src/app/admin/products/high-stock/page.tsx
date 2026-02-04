"use client";

import { useEffect, useState } from "react";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product.types";
import { ArrowLeft, Archive, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ImagePreviewModal from "@/components/common/ImagePreviewModal";

export default function HighStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchHighStock = async (page: number) => {
    setLoading(true);
    try {
      // Gọi API High Stock
      const res = await productService.getHighStockProducts(page, pageSize);
      setProducts(res.content); 
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighStock(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard" className="p-2 bg-white rounded-full border hover:bg-gray-100 transition">
                    <ArrowLeft size={20} className="text-gray-600"/>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        {/* Icon và Tiêu đề mới */}
                        <Archive className="text-blue-600" /> Sản phẩm tồn kho nhiều
                    </h1>
                    <p className="text-gray-500 text-sm">Danh sách sản phẩm có số lượng tồn kho lớn nhất</p>
                </div>
            </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 className="animate-spin text-blue-500" size={32}/>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="p-4 border-b">Sản phẩm</th>
                                <th className="p-4 border-b">Danh mục</th>
                                <th className="p-4 border-b text-center">Tồn kho</th>
                                <th className="p-4 border-b text-right">Giá trị tồn (Ước tính)</th>
                                <th className="p-4 border-b text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-100">
                            {products.length > 0 ? products.map((product) => (
                                <tr key={product.productId} className="hover:bg-gray-50 transition">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="relative w-12 h-12 rounded border bg-gray-100 overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                                                onClick={() => setPreviewImage(product.image || "https://placehold.co/400")}
                                            >
                                                <Image 
                                                    src={product.image || "https://placehold.co/50"} 
                                                    alt={product.productName} 
                                                    fill 
                                                    className="object-cover"
                                                />
                                            </div>
                                            <span className="font-medium text-gray-800 line-clamp-2 max-w-xs" title={product.productName}>
                                                {product.productName}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">{product.categoryName}</td>
                                    <td className="p-4 text-center">
                                        {/* Badge màu xanh dương */}
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                            {product.stockQuantity}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-medium text-gray-600">
                                        {/* Tính sơ bộ giá trị tồn kho: Giá x Số lượng */}
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price * product.stockQuantity)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <Link 
                                            href={`/admin/products/${product.productId}`} 
                                            className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded transition text-xs font-medium"
                                        >
                                            Chi tiết <ExternalLink size={14}/>
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                        Không có dữ liệu sản phẩm.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t bg-gray-50">
                    <span className="text-xs text-gray-500">
                        Trang {currentPage + 1} / {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button 
                            disabled={currentPage === 0}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 text-xs"
                        >
                            Trước
                        </button>
                        <button 
                            disabled={currentPage === totalPages - 1}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 text-xs"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      <ImagePreviewModal 
          src={previewImage} 
          onClose={() => setPreviewImage(null)} 
      />

    </div>
  );
}