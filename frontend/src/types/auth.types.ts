// Login Request
export interface LoginRequest {
  email: string; 
  password: string;
}

// Login Response 
export interface LoginResponse {
  token: string;
  refreshToken: string;
  id: number;
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
  id: number ;
  username: string;
  email: string;
  role: string;
  avatar?: string | null;
}