export interface Product {
  productId: number;
  productName: string;
  price: number;
  image: string;
  description: string;
  categoryName: string;
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