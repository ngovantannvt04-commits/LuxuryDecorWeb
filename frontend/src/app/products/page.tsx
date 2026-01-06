"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect, useState } from "react";
import { productService } from "@/services/product.service";
import { Category, Product } from "@/types/product.types";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Filter, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // States cho bộ lọc
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState("newest");
  const { addToCart } = useCart();
  
  // Pagination State
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    setPage(0);
    // Khi tìm kiếm, nên bỏ chọn danh mục để tránh nhầm lẫn
    setSelectedCategory(undefined); 
    setMinPrice(undefined);
    setMaxPrice(undefined);
  };

  const handleCategoryClick = (catId?: number) => {
    setSelectedCategory(catId);
    setPage(0);
    // Khi lọc danh mục, nên xóa từ khóa tìm kiếm
    setKeyword(""); 
  };


  // 1. Load danh mục khi vào trang
  useEffect(() => {
    productService.getCategories().then(setCategories).catch(console.error);
  }, []);

  // 2. Load sản phẩm khi filter thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productService.getAllProducts({
          page,
          size: 18, // 18 sản phẩm mỗi trang
          keyword: keyword || undefined, // Nếu rỗng thì gửi undefined để backend bỏ qua
          categoryId: selectedCategory,
          minPrice,
          maxPrice,
          sortBy
        });
        setProducts(res.content);
        setTotalPages(res.totalPages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce tìm kiếm (chờ 500ms sau khi gõ xong mới gọi API)
    const timeoutId = setTimeout(() => {
        fetchProducts();
    }, 500);

    return () => clearTimeout(timeoutId);

  }, [page, keyword, selectedCategory, minPrice, maxPrice, sortBy]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
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
                <input 
                    type="text" 
                    placeholder="Tên sản phẩm..." 
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-black"
                    value={keyword}
                    onChange={handleSearch}
                />
            </div>

            {/* Danh mục */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
                <h3 className="font-bold mb-3 flex items-center gap-2"><Filter size={18}/> Danh mục</h3>
                <ul className="space-y-2">
                    <li 
                        className={`cursor-pointer hover:text-amber-600 ${!selectedCategory ? 'font-bold text-amber-600' : 'text-gray-600'}`}
                        onClick={() => handleCategoryClick(undefined)}
                    >
                        Tất cả
                    </li>
                    {categories.map((cat) => (
                        <li 
                            key={cat.categoryId}
                            className={`cursor-pointer hover:text-amber-600 ${selectedCategory === cat.categoryId ? 'font-bold text-amber-600' : 'text-gray-600'}`}
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
                        onChange={(e) => setMinPrice(Number(e.target.value) || undefined)}
                    />
                    <input 
                        type="number" placeholder="Max" 
                        className="w-1/2 border p-2 rounded text-sm"
                        onChange={(e) => setMaxPrice(Number(e.target.value) || undefined)}
                    />
                </div>
                <button 
                    onClick={() => setPage(0)} // Trigger lại useEffect
                    className="w-full bg-black text-white py-2 rounded-lg text-sm hover:bg-gray-800"
                >
                    Áp dụng
                </button>
            </div>
          </aside>

          {/* === MAIN CONTENT (GRID SẢN PHẨM) === */}
          <main className="flex-1">
            
            {/* Sort Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold">Danh sách sản phẩm</h2>
                <div className="relative">
                    <select
                    className="appearance-none border border-gray-300 rounded-xl px-4 py-2 pr-10 bg-white cursor-pointer focus:outline-none"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    >
                    <option value="newest">Mới nhất</option>
                    <option value="price_asc">Giá: Thấp đến Cao</option>
                    <option value="price_desc">Giá: Cao đến Thấp</option>
                    </select>

                    <ChevronDown
                    size={22}
                    strokeWidth={2.25}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
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
                            href={`/products/${product.productId}`} // Đường dẫn đến trang detail
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
                                
                                {/* 👇 3. Xử lý nút giỏ hàng để không bị nhảy trang khi bấm */}
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault(); // Chặn hành vi chuyển trang của Link
                                        addToCart(product, 1); // Thêm 1 sản phẩm
                                        alert("Đã thêm vào giỏ!");
                                        console.log("Thêm vào giỏ:", product.productId);
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
                        disabled={page === 0}
                        onClick={() => handlePageChange(page - 1)}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                        Trước
                    </button>
                    <span className="px-4 py-2 bg-black text-white rounded-lg">
                        Trang {page + 1} / {totalPages}
                    </span>
                    <button 
                        disabled={page === totalPages - 1}
                        onClick={() => handlePageChange(page + 1)}
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