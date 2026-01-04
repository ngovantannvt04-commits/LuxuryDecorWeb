import axiosClient from "@/utils/axiosClient";
import { LoginRequest, LoginResponse, RegisterRequest, ResetPasswordRequest, AuthUser } from "@/types/auth.types";

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return axiosClient.post('/auth/login', data);
  },

  register: async (data: RegisterRequest) => {
    return axiosClient.post('/auth/register', data);
  },
  
  // Hàm lưu token 
  setSession: (token: string, refreshToken: string, user?: AuthUser) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("accessToken", token);
      sessionStorage.setItem("refreshToken", refreshToken);
      // Lưu thông tin user 
      if (user) {
        sessionStorage.setItem("user", JSON.stringify(user));
      }
    }
  },
  
    forgotPassword: async (email: string) => {
    return axiosClient.post('/auth/forgot-password', { email });
  },

  // hàm verify
  verifyAccount: async (email: string, otp: string) => {
    return axiosClient.post("/auth/verify", { email, otp });
  },

  // hàm reset password
  resetPassword: async (data: ResetPasswordRequest) => {
    return axiosClient.post("/auth/reset-password", data);
  },

  getUser: (): AuthUser | null => {
    if (typeof window !== "undefined") {
      const userStr = sessionStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  logout: () => {
      if (typeof window !== "undefined") {
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("user");
    }
  }
};