import axiosClient from "@/utils/axiosClient";
import { CartResponse } from "@/types/cart.types";

// Cấu hình URL tới Order Service
const CART_API = "http://localhost:8083/api/carts"; 

export const cartService = {
  getMyCart: async (): Promise<CartResponse> => {
    return axiosClient.get("/my-cart", { baseURL: CART_API });
  },

  addToCart: async (productId: number, quantity: number) => {
    return axiosClient.post("/add", { productId, quantity }, { baseURL: CART_API });
  },

  removeFromCart: async (productId: number) => {
    return axiosClient.delete(`/remove/${productId}`, { baseURL: CART_API });
  }
};