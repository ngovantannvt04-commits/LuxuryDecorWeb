import axiosClient from "@/utils/axiosClient";
import { LoginRequest, LoginResponse, RegisterRequest, ResetPasswordRequest } from "@/types/auth.types";

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

  // 1. Thêm hàm verify
  verifyAccount: async (email: string, otp: string) => {
    return axiosClient.post("/auth/verify", { email, otp });
  },

  // 2. Thêm hàm reset password
  resetPassword: async (data: ResetPasswordRequest) => {
    return axiosClient.post("/auth/reset-password", data);
  },

  logout: () => {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
  }
};