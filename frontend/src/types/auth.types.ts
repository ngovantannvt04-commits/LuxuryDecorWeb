// Login Request
export interface LoginRequest {
  email: string; 
  password: string;
}

// Login Response 
export interface LoginResponse {
  token: string;
  refreshToken: string;
  userId: number;
  username: string;
  email: string;
  role: string;
  message: string;
}

// Register Request
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  repassword: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string; 
}

export interface AuthUser {
  userId: number ;
  username: string;
  email: string;
  role: string;
  avatar?: string | null;
  phoneNumber?: string;
  address?: string;
}

export interface UpdateProfileRequest {
  phoneNumber?: string;
  address?: string;
  avatar?: string;
}

export interface UserParams {
    page?: number;
    size?: number;
    keyword?: string;
}

// Request khi TẠO MỚI
export interface UserCreateRequest {
    username: string;
    password: string; 
    email: string;
    role: string;
    phoneNumber?: string;
    address?: string;
    avatar?: string;
}

export interface UserUpdateRequest {
    phoneNumber?: string;
    address?: string;
    avatar?: string;
    role?: string; 
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; 
}