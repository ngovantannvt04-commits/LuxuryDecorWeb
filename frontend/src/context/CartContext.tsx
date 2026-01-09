"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Product } from "@/types/product.types";
import { authService } from "@/services/auth.service";
import { cartService } from "@/services/cart.service";
import LoginRequestModal from "@/components/ui/LoginRequestModal"; 
import { CartResponse, CartItemResponse } from "@/types/cart.types";

// Định nghĩa kiểu dữ liệu Frontend (để hiển thị UI)
export interface CartItem {
  productId: number;
  productName: string;
  price: number;
  image: string;
  quantity: number;
  stockQuantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, newQuantity: number) => Promise<void>;
  clearCart: () => void;
  fetchCart: () => Promise<void>; // Expose hàm này để gọi khi Login thành công
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State quản lý Modal Login
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // === 1. HÀM LOAD GIỎ HÀNG TỪ API ===
  const fetchCart = async () => {
    // Chỉ gọi API nếu đã đăng nhập
    const user = await authService.getUser();
    if (!user) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      const res: CartResponse = await cartService.getMyCart();
      
      // Map dữ liệu từ Backend (CartItemResponse) sang Frontend (CartItem)
      const mappedItems: CartItem[] = (res.items || []).map((item: CartItemResponse) => ({
        productId: item.productId,
        productName: item.productName || "Sản phẩm",
        price: item.productPrice || 0,   
        image: item.productImage || "",  
        quantity: item.quantity,
        stockQuantity: item.stockQuantity || 0
      }));

      setCartItems(mappedItems);
    } catch (error) {
      console.error("Lỗi tải giỏ hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load giỏ hàng lần đầu khi vào web
  useEffect(() => {
    fetchCart();
  }, []);

  // === 2. CÁC HÀM CHỨC NĂNG ===

  const addToCart = async (product: Product, quantity: number = 1) => {
    const user = await authService.getUser();

    // A. Nếu chưa đăng nhập -> Hiện Modal
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    // B. Nếu đã đăng nhập -> Gọi API
    try {
      await cartService.addToCart(product.productId, quantity);
      // Sau khi thêm xong, load lại giỏ để đồng bộ data mới nhất
      await fetchCart();
    } catch (error) {
      console.error("Lỗi thêm giỏ hàng:", error);
      alert("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
      // Optimistic Update: Xóa trên UI trước cho mượt
      setCartItems((prev) => prev.filter((item) => item.productId !== productId));
      
      // Gọi API xóa thật
      await cartService.removeFromCart(productId);
      
      // Load lại cho chắc chắn (để tính lại tổng tiền chuẩn từ BE)
      await fetchCart();
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      fetchCart(); // Revert lại nếu lỗi
    }
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    // Tạm thời Backend chưa có API update số lượng riêng biệt (PUT)
    // Mẹo: Ta có thể dùng addToCart với số lượng chênh lệch, 
    // hoặc gọi API add với số lượng mới nếu backend hỗ trợ override.
    // Tạm thời ở đây ta chỉ update UI, bài sau ta sẽ bổ sung API update quantity bên BE.
    
    // Logic tạm: Update UI Local
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
    
    // TODO: Cần implement API update-quantity bên Backend để hoàn thiện
    // await cartService.updateQuantity(productId, newQuantity); 
  };

  const clearCart = () => {
    setCartItems([]);
    // Thường thì sau khi Checkout thành công, Backend tự clear, Frontend chỉ cần clear state.
  };

  // === 3. TÍNH TOÁN ===
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        fetchCart,
        totalItems, 
        totalPrice,
        loading 
      }}
    >
      {children}

      {/* MODAL YÊU CẦU ĐĂNG NHẬP */}
      <LoginRequestModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};