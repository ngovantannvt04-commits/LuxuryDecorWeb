export interface CartItemResponse {
  cartItemId: number;
  productId: number;
  quantity: number;
  productName: string;
  productPrice: number;
  productImage: string; 
  stockQuantity: number;
}

export interface CartResponse {
  cartId: string;   
  userId: number;
  totalItems: number;  
  items: CartItemResponse[]; 
}