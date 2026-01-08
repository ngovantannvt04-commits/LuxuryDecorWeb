import axiosClient from "@/utils/axiosClient";
import { AuthUser, UpdateProfileRequest, UserCreateRequest, UserParams, UserUpdateRequest } from "@/types/auth.types";

const ENDPOINT = "/users"; 

export const userService = {
  // 1. Lấy thông tin profile mới nhất từ Server (thay vì lấy từ SessionStorage cũ)
  getMyProfile: async (): Promise<AuthUser> => {
    return axiosClient.get(`${ENDPOINT}/profile`);
  },

  // 2. Cập nhật thông tin
  updateProfile: async (data: UpdateProfileRequest): Promise<AuthUser> => {
    return axiosClient.put(`${ENDPOINT}/profile`, data);
  },

  // === 2. ADMIN MANAGEMENT (Quản trị) ===
  
  // Lấy danh sách users (Phân trang + Tìm kiếm)
  getAllUsers: async (params: UserParams) => {
    // Backend trả về Page<UserResponse>
    return axiosClient.get(`${ENDPOINT}`, { 
        params: {
            page: params.page,
            size: params.size,
            keyword: params.keyword
        }
    });
  },

  // Admin lấy chi tiết user
  getUserById: async (id: number): Promise<AuthUser> => {
    return axiosClient.get(`${ENDPOINT}/${id}`);
  },

  // Admin tạo user mới
  createUser: async (data: UserCreateRequest): Promise<AuthUser> => {
    // Endpoint: /api/users/create
    return axiosClient.post(`${ENDPOINT}/create`, data);
  },

  // Admin cập nhật user (Role, Info)
  updateUser: async (id: number, data: UserUpdateRequest): Promise<AuthUser> => {
    return axiosClient.put(`${ENDPOINT}/${id}`, data);
  },

  // Admin xóa user
  deleteUser: async (id: number) => {
    return axiosClient.delete(`${ENDPOINT}/${id}`);
  }
};