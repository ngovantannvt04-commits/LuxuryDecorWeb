"use client";

import { useEffect, useRef, useState } from "react";
import { productService } from "@/services/product.service";
import { Category, Product } from "@/types/product.types";
import { Edit, Trash2, Plus, Search, X, Image as ImageIcon, Loader2, UploadCloud, ChevronDown } from "lucide-react";

export default function AdminProductsPage() {
  // === STATE QUẢN LÝ DỮ LIỆU ===
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // === STATE CHO MODAL THÊM/SỬA ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // Nếu null => Mode Thêm, có data => Mode Sửa
  
  // State cho việc upload ảnh
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form Data
  const [formData, setFormData] = useState({
    productName: "",
    price: 0,
    stockQuantity: 0,
    description: "",
    image: "",
    categoryId: 1 // Default ID
  });

  // 1. Load Data (Products & Categories)
  useEffect(() => {
    fetchProducts();
    productService.getCategories().then(setCategories).catch(console.error);
  }, [page, keyword]); // Reload khi trang hoặc keyword đổi

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Backend Admin thường cần API lấy tất cả không phân biệt active/inactive
      // Ở đây dùng tạm hàm getAllProducts cũ
      const res = await productService.getAllProducts({
        page, size: 10, keyword, sortBy: "newest"
      });
      setProducts(res.content);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý Mở Modal
  const openModal = (product?: Product) => {
    if (product) {
      // Mode EDIT
      setEditingProduct(product);
      setFormData({
        productName: product.productName,
        price: product.price,
        stockQuantity: product.stockQuantity,
        description: product.description || "",
        image: product.image || "",
        categoryId: product.categoryId || categories[0]?.categoryId
      });
    } else {
      // Mode ADD
      setEditingProduct(null);
      setFormData({
        productName: "",
        price: 0,
        stockQuantity: 10,
        description: "",
        image: "",
        categoryId: categories[0]?.categoryId || 1
      });
    }
    setIsModalOpen(true);
  };

  // Xử lý Upload Ảnh
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file ảnh");
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        alert("File quá lớn (>10MB)");
        return;
    }

    try {
        setUploading(true);
        // Gọi API upload sang Product Service
        const url = await productService.uploadImage(file);
        
        // Gán URL trả về vào formData
        setFormData(prev => ({ ...prev, image: url }));
    } catch (error) {
        console.error("Upload lỗi:", error);
        alert("Lỗi khi upload ảnh. Vui lòng thử lại.");
    } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 3. Xử lý Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // UPDATE
        await productService.updateProduct(editingProduct.productId, formData);
        alert("Cập nhật thành công!");
      } else {
        // CREATE
        await productService.createProduct(formData);
        alert("Thêm mới thành công!");
      }
      setIsModalOpen(false);
      fetchProducts(); // Refresh list
    } catch (error) {
      alert("Có lỗi xảy ra, vui lòng kiểm tra lại!");
      console.error(error);
    }
  };

  // 4. Xử lý Xóa
  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await productService.deleteProduct(id);
        fetchProducts();
      } catch (error) {
        alert("Không thể xóa sản phẩm này (có thể do đã có đơn hàng)");
      }
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div>
      {/* HEADER PAGE */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
        <button 
          onClick={() => openModal()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 shadow-sm"
        >
          <Plus size={20} /> Thêm sản phẩm
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex gap-4">
        <div className="flex-1 relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
           <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm theo tên..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={keyword}
              onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(0); // Reset về trang 1 khi tìm kiếm
              }}
           />
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-sm">
            <tr>
              <th className="p-4 border-b">ID</th>
              <th className="p-4 border-b">Hình ảnh</th>
              <th className="p-4 border-b">Tên sản phẩm</th>
              <th className="p-4 border-b">Danh mục</th>
              <th className="p-4 border-b">Giá</th>
              <th className="p-4 border-b">Kho</th>
              <th className="p-4 border-b text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-base text-gray-600">
            {loading ? (
               <tr><td colSpan={7} className="p-6 text-center">Đang tải dữ liệu...</td></tr>
            ) : products.length === 0 ? (
               <tr><td colSpan={7} className="p-6 text-center">Không tìm thấy sản phẩm nào.</td></tr>
            ) : (
               products.map((product) => (
                 <tr key={product.productId} className="hover:bg-gray-50 border-b last:border-0">
                    <td className="p-4">#{product.productId}</td>
                    <td className="p-4">
                        <div className="w-25 h-25 relative bg-gray-100 rounded border overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={product.image || "/logo-niri-main.png"} 
                                alt={product.productName} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/logo-niri-main.png"; 
                                    target.onerror = null; 
                                    target.alt = "Ảnh lỗi - Hiển thị logo mặc định";
                                    target.className = "w-full h-full object-cover opacity-90"; 
                                }}
                            />
                        </div>
                    </td>
                    <td className="p-4">
                        <p
                        title={product.productName}
                        className="
                          max-w-[350px]
                          font-medium text-gray-700
                          line-clamp-2
                          leading-snug
                        "
                      >
                        {product.productName}
                      </p>
                    </td>
                    <td className="p-4">
                        <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-semibold">
                            {product.categoryName}
                        </span>
                    </td>
                    <td className="p-4 font-bold text-amber-600">{formatCurrency(product.price)}</td>
                    <td className="p-4">
                        {product.stockQuantity > 0 ? (
                            <span className="text-green-600 font-medium">{product.stockQuantity}</span>
                        ) : (
                            <span className="text-red-500 font-medium">Hết hàng</span>
                        )}
                    </td>
                    <td className="p-4">
                        <div className="flex justify-center gap-2">
                            <button 
                                onClick={() => openModal(product)}
                                className="p-2.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Sửa"
                            >
                                <Edit size={18} />
                            </button>
                            <button 
                                onClick={() => handleDelete(product.productId)}
                                className="p-2.5 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Xóa"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </td>
                 </tr>
               ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="mt-6 flex justify-end gap-2">
         <button 
            disabled={page === 0} 
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
         >Trước</button>
         <span className="px-4 py-2 bg-white border rounded">Trang {page + 1} / {totalPages}</span>
         <button 
            disabled={page >= totalPages - 1} 
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
         >Sau</button>
      </div>

      {/* === MODAL THÊM / SỬA === */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-800">
                        {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm (*)</label>
                            <input 
                                type="text" required
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.productName}
                                onChange={e => setFormData({...formData, productName: e.target.value})}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                            <select 
                                className="appearance-none w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.categoryId}
                                onChange={e => setFormData({...formData, categoryId: Number(e.target.value)})}
                            >
                                {categories.map(c => (
                                    <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                                ))}
                            </select>
                            <ChevronDown size={22} className="pointer-events-none absolute right-4 top-1/2 text-gray-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) (*)</label>
                            <input 
                                type="number" required min="0"
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng kho (*)</label>
                            <input 
                                type="number" required min="0"
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.stockQuantity}
                                onChange={e => setFormData({...formData, stockQuantity: Number(e.target.value)})}
                            />
                        </div>
                    </div>

                    {/* ==== UPLOAD ẢNH ==== */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh sản phẩm</label>
                        
                        <div className="flex items-start gap-6">
                            {/* Khu vực Preview Ảnh */}
                            <div className="w-50 h-50 relative bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                                {formData.image ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img 
                                            src={formData.image} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = "/logo-niri-main.png"; 
                                                target.alt = "Ảnh lỗi - Hiển thị logo mặc định";
                                                target.className = "w-full h-full object-cover opacity-90"; 
                                            }} 
                                        />
                                        {/* Nút xóa ảnh */}
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
                                            title="Xóa ảnh"
                                        >
                                            <X size={12} />
                                        </button>
                                    </>
                                ) : (
                                    <ImageIcon className="text-gray-400" size={32} />
                                )}
                                
                                {/* Overlay Loading */}
                                {uploading && (
                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                        <Loader2 className="animate-spin text-blue-600" size={24} />
                                    </div>
                                )}
                            </div>

                            {/* Khu vực Nút Upload */}
                            <div className="flex-1">
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`
                                        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition 
                                        ${uploading ? 'bg-gray-50 border-gray-300 cursor-not-allowed' : 'border-blue-300 bg-blue-50 hover:bg-blue-100'}
                                    `}
                                >
                                    <UploadCloud className="mx-auto text-blue-500 mb-2" size={32} />
                                    <p className="text-sm font-medium text-gray-700">
                                        {uploading ? "Đang tải lên..." : "Click để tải ảnh lên"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG tối đa 10MB</p>
                                </div>
                                <input 
                                    type="text" 
                                    className="w-full border p-2 mt-6 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://..."
                                    value={formData.image}
                                    onChange={e => setFormData({...formData, image: e.target.value})}
                                />
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    disabled={uploading}
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none h-32"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                        >Hủy</button>
                        <button 
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            {editingProduct ? "Lưu thay đổi" : "Tạo sản phẩm"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}