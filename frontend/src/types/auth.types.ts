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