export interface Product {
  productId: number;
  productName: string;
  price: number;
  image: string;
  description: string;
  categoryName: string;
  categoryId: number;
  stockQuantity: number;
  quantitySold: number;
  createdAt: string;
}

export interface Category {
  categoryId: number;
  categoryName: string;
}

export interface ProductResponse {
  content: Product[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface ProductParams {
  page?: number;
  size?: number;
  keyword?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}

export interface ProductRequest {
  productName: string;
  price: number;
  stockQuantity: number;
  description?: string;
  image?: string;
  categoryId: number;
}

export interface UploadImageResponse {
  url: string;
}

export interface ProductStatsResponse {
    total_products: number;
    low_stock_products: number;
}