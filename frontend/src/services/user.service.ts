import axiosClient from "@/utils/axiosClient";
import { AuthUser, UpdateProfileRequest } from "@/types/auth.types";

const ENDPOINT = "/users"; 

export const userService = {
  // 1. Lấy thông tin profile mới nhất từ Server (thay vì lấy từ SessionStorage cũ)
  getMyProfile: async (): Promise<AuthUser> => {
    return axiosClient.get(`${ENDPOINT}/profile`);
  },

  // 2. Cập nhật thông tin
  updateProfile: async (data: UpdateProfileRequest): Promise<AuthUser> => {
    return axiosClient.put(`${ENDPOINT}/profile`, data);
  }
};