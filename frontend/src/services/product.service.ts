import axios from "axios";
import axiosClient from "@/utils/axiosClient";
import { Category, Product, ProductParams, ProductResponse, ProductRequest } from "@/types/product.types";

// URL của Product Service
const API_URL = "http://localhost:8082/api/products";

export const productService = {
  // 1. Lấy tất cả (có hỗ trợ Filter/Search)
  getAllProducts: async (params: ProductParams): Promise<ProductResponse> => {
    let url = API_URL;
    const requestParams: ProductParams = {
      page: params.page,
      size: params.size,
      sortBy: params.sortBy // Backend cần update thêm logic sort ở route Search/Filter nếu muốn đồng bộ
    };

    // TRƯỜNG HỢP 1: Có từ khóa tìm kiếm -> Gọi Route Search
    if (params.keyword && params.keyword.trim() !== "") {
      url = `${API_URL}/search`;
      requestParams.keyword = params.keyword;
    } 
    // TRƯỜNG HỢP 2: Có lọc theo Danh mục hoặc Giá -> Gọi Route Filter
    else if (params.categoryId || params.minPrice || params.maxPrice) {
      url = `${API_URL}/filter`;
      if (params.categoryId) requestParams.categoryId = params.categoryId;
      if (params.minPrice) requestParams.minPrice = params.minPrice;
      if (params.maxPrice) requestParams.maxPrice = params.maxPrice;
    }
    // TRƯỜNG HỢP 3: Mặc định -> Gọi Route gốc (Lấy tất cả)
    
    console.log("Calling API:", url, requestParams); // Log để debug xem nó gọi đúng chưa

    const res = await axios.get(url, { params: requestParams });
    return res.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  },

  // 2. Lấy danh sách Category
  getCategories: async (): Promise<Category[]> => {
    const res = await axios.get(`${API_URL}/categories`);
    return res.data;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    // Lưu ý: Backend trả về List<ProductResponse> (mảng), không phải Page
    const res = await axios.get(`${API_URL}/featured`);
    return res.data; 
  },

  // === ADMIN ===
  // 5. Thêm mới (Dùng ProductRequest thay any)
  createProduct: async (productData: ProductRequest) => {
    return axiosClient.post(`${API_URL}/create`, productData);
  },

  // 6. Cập nhật
  updateProduct: async (id: number, productData: ProductRequest) => {
    return axiosClient.put(`${API_URL}/${id}`, productData);
  },

  // 7. Xóa
  deleteProduct: async (id: number) => {
    return axiosClient.delete(`${API_URL}/${id}`);
  }

};