import axiosClient from "@/utils/axiosClient";
import { LoginRequest, LoginResponse, RegisterRequest } from "@/types/auth.types";

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return axiosClient.post('/auth/login', data);
  },

  register: async (data: RegisterRequest) => {
    return axiosClient.post('/auth/register', data);
  },
  
  // Hàm lưu token vào LocalStorage (Helper)
  setSession: (accessToken: string, refreshToken: string) => {
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
  },
  
    forgotPassword: async (email: string) => {
    // API này tùy thuộc backend bạn viết là gì, thường là /auth/forgot-password
    return axiosClient.post('/auth/forgot-password', { email });
  },

  logout: () => {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
  }
};