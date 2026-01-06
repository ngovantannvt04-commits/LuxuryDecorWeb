"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Product } from "@/types/product.types";

// Định nghĩa kiểu dữ liệu cho 1 món hàng trong giỏ
export interface CartItem {
  productId: number;
  productName: string;
  price: number;
  image: string;
  quantity: number;
  stockQuantity: number; // Để check max tồn kho
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, newQuantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Load giỏ hàng từ LocalStorage khi mở web
  useEffect(() => {
    const loadCartFromStorage = () => {
      try {
        const savedCart = localStorage.getItem("niri_cart");
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error("Lỗi khi đọc giỏ hàng từ LocalStorage:", error);
        // Nếu lỗi JSON, có thể chọn xóa luôn dữ liệu hỏng
        localStorage.removeItem("niri_cart");
      } finally {
        setIsLoaded(true);
      }
    };

    loadCartFromStorage();
  }, []);

  // 2. Lưu vào LocalStorage mỗi khi giỏ hàng thay đổi
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("niri_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  // === CÁC HÀM CHỨC NĂNG ===

  const addToCart = (product: Product, quantity: number) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.productId === product.productId);
      
      if (existingItem) {
        // Nếu đã có -> Cộng dồn số lượng
        return prev.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stockQuantity) }
            : item
        );
      } else {
        // Nếu chưa có -> Thêm mới
        return [
          ...prev,
          {
            productId: product.productId,
            productName: product.productName,
            price: product.price,
            image: product.image,
            stockQuantity: product.stockQuantity,
            quantity: quantity,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Tính toán tổng
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook để dùng nhanh ở các component khác
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};