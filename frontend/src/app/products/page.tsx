"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect, useState, useCallback } from "react";
import { productService } from "@/services/product.service";
import { Category, Product } from "@/types/product.types";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Filter, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
// 1. Import hooks điều hướng
import { useRouter, useSearchParams } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();

  // === 2. ĐỌC DỮ LIỆU TỪ URL (URL-Driven State) ===
  // Backend đếm từ 0, nhưng URL để thân thiện user ta đếm từ 1
  const currentPage = Number(searchParams.get("page")) || 1; 
  const currentKeyword = searchParams.get("keyword") || "";
  const currentCategory = searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined;
  const currentMinPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const currentMaxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const currentSort = searchParams.get("sortBy") || "newest";

  // === 3. STATE DỮ LIỆU HIỂN THỊ ===
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  // State tạm cho các ô Input (để tránh reload trang khi đang gõ từng chữ)
  const [tempKeyword, setTempKeyword] = useState(currentKeyword);
  const [tempMinPrice, setTempMinPrice] = useState<string | number>(currentMinPrice || "");
  const [tempMaxPrice, setTempMaxPrice] = useState<string | number>(currentMaxPrice || "");

  // Đồng bộ lại Input khi URL thay đổi (trường hợp user ấn Back/Forward browser)
  useEffect(() => {
    setTempKeyword(currentKeyword);
    setTempMinPrice(currentMinPrice || "");
    setTempMaxPrice(currentMaxPrice || "");
  }, [currentKeyword, currentMinPrice, currentMaxPrice]);

  // Load danh mục 1 lần duy nhất
  useEffect(() => {
    productService.getCategories().then(setCategories).catch(console.error);
  }, []);

  // === 4. HÀM CẬP NHẬT URL (Logic cốt lõi) ===
  const updateQuery = useCallback((newParams: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Duyệt qua các tham số mới để cập nhật
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === 0) {
        params.delete(key); // Xóa nếu rỗng
      } else {
        params.set(key, String(value));
      }
    });

    // Reset về trang 1 nếu thay đổi bộ lọc (trừ khi đang bấm chuyển trang)
    if (!newParams.page) {
      params.set("page", "1");
    }

    // Đẩy lên URL
    router.push(`/products?${params.toString()}`, { scroll: true }); // scroll: false để đỡ bị giật màn hình lên top
  }, [router, searchParams]);


  // === 5. GỌI API KHI URL THAY ĐỔI ===
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productService.getAllProducts({
          page: currentPage - 1, // API cần trang 0, URL là trang 1
          size: 18,
          keyword: currentKeyword,
          categoryId: currentCategory,
          minPrice: currentMinPrice,
          maxPrice: currentMaxPrice,
          sortBy: currentSort
        });
        setProducts(res.content);
        setTotalPages(res.totalPages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, currentKeyword, currentCategory, currentMinPrice, currentMaxPrice, currentSort]);


  // === 6. CÁC HÀM XỬ LÝ SỰ KIỆN (UI) ===

  // Xử lý tìm kiếm
  const handleSearchSubmit = () => {
    updateQuery({ keyword: tempKeyword });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearchSubmit();
  };

  // Xử lý chọn danh mục
  const handleCategoryClick = (catId?: number) => {
    // Khi chọn danh mục thì xóa keyword tìm kiếm cũ đi cho đỡ rối
    updateQuery({ categoryId: catId, keyword: undefined });
  };

  // Xử lý lọc giá
  const handlePriceApply = () => {
    updateQuery({ 
      minPrice: tempMinPrice ? Number(tempMinPrice) : undefined, 
      maxPrice: tempMaxPrice ? Number(tempMaxPrice) : undefined 
    });
  };

  // Xử lý chuyển trang
  const handlePageChange = (newPage: number) => { // newPage này là số hiển thị (1,2,3...)
    if (newPage >= 1 && newPage <= totalPages) {
      updateQuery({ page: newPage });
    }
  };

  const formatCurrency = (amount: number) => 
     new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* === SIDEBAR (BỘ LỌC) === */}
          <aside className="w-full md:w-64 space-y-8 h-fit">
            
            {/* Tìm kiếm */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
                <h3 className="font-bold mb-3 flex items-center gap-2"><Search size={18}/> Tìm kiếm</h3>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Tên sản phẩm..." 
                        className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-black"
                        value={tempKeyword}
                        onChange={(e) => setTempKeyword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button 
                        onClick={handleSearchSubmit}
                        className="bg-black text-white p-2 rounded-lg hover:bg-gray-800"
                    >
                        <Search size={20}/>
                    </button>
                </div>
            </div>

            {/* Danh mục */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
                <h3 className="font-bold mb-3 flex items-center gap-2"><Filter size={18}/> Danh mục</h3>
                <ul className="space-y-2">
                    <li 
                        className={`cursor-pointer hover:text-amber-600 ${!currentCategory ? 'font-bold text-amber-600' : 'text-gray-600'}`}
                        onClick={() => handleCategoryClick(undefined)}
                    >
                        Tất cả
                    </li>
                    {categories.map((cat) => (
                        <li 
                            key={cat.categoryId}
                            className={`cursor-pointer hover:text-amber-600 ${currentCategory === cat.categoryId ? 'font-bold text-amber-600' : 'text-gray-600'}`}
                            onClick={() => handleCategoryClick(cat.categoryId)}
                        >
                            {cat.categoryName}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Khoảng giá */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
                <h3 className="font-bold mb-3">Khoảng giá</h3>
                <div className="flex gap-2 mb-2">
                    <input 
                        type="number" placeholder="Min" 
                        className="w-1/2 border p-2 rounded text-sm"
                        value={tempMinPrice}
                        onChange={(e) => setTempMinPrice(e.target.value)}
                    />
                    <input 
                        type="number" placeholder="Max" 
                        className="w-1/2 border p-2 rounded text-sm"
                        value={tempMaxPrice}
                        onChange={(e) => setTempMaxPrice(e.target.value)}
                    />
                </div>
                <button 
                    onClick={handlePriceApply}
                    className="w-full bg-black text-white py-2 rounded-lg text-sm hover:bg-gray-800"
                >
                    Áp dụng
                </button>
            </div>
          </aside>

          {/* === MAIN CONTENT === */}
          <main className="flex-1">
            
            {/* Sort Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-sans font-bold">
                   {currentKeyword ? `Kết quả tìm kiếm: "${currentKeyword}"` : 
                    currentCategory ? categories.find(c => c.categoryId === currentCategory)?.categoryName : "Tất cả sản phẩm"}
                </h2>
                <div className="relative">
                    <select
                        className="appearance-none border border-gray-300 rounded-xl px-4 py-2 pr-10 bg-white cursor-pointer focus:outline-none"
                        value={currentSort}
                        onChange={(e) => updateQuery({ sortBy: e.target.value })}
                    >
                        <option value="newest">Mới nhất</option>
                        <option value="price_asc">Giá: Thấp đến Cao</option>
                        <option value="price_desc">Giá: Cao đến Thấp</option>
                    </select>
                    <ChevronDown size={22} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                 <div className="h-64 flex items-center justify-center">Đang tải dữ liệu...</div>
            ) : products.length === 0 ? (
                 <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                    <p>Không tìm thấy sản phẩm nào phù hợp.</p>
                 </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <Link 
                            key={product.productId} 
                            href={`/products/${product.productId}`} 
                            className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition group block"
                        >
                            <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gray-100 mb-4">
                                <Image 
                                    src={product.image || "https://placehold.co/400x400"} 
                                    alt={product.productName} 
                                    fill 
                                    className="object-cover group-hover:scale-105 transition duration-500" 
                                />
                            </div>
                            <div className="text-xs text-gray-500 mb-1">{product.categoryName}</div>
                            <h3 className="font-bold text-gray-900 truncate">{product.productName}</h3>
                            
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-amber-700 font-bold">{formatCurrency(product.price)}</span>
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault(); 
                                        e.stopPropagation();
                                        addToCart(product, 1); 
                                        alert("Đã thêm vào giỏ!");
                                    }}
                                    className="p-2 bg-gray-100 rounded-full hover:bg-black hover:text-white transition z-10 relative"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-10 gap-2">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                        Trước
                    </button>
                    <span className="px-4 py-2 bg-black text-white rounded-lg">
                        Trang {currentPage} / {totalPages}
                    </span>
                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                        Sau
                    </button>
                </div>
            )}

          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}