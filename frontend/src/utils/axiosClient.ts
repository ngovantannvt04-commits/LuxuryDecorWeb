import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Xử lý trước khi gửi Request (Gắn Token vào Header)
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ hoặc SessionStorage
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Xử lý sau khi nhận Response (Nơi xử lý Refresh Token sau này)
axiosClient.interceptors.response.use(
  (response) => response.data, // Trả về data 
  (error) => {
    // Xử lý lỗi chung 
    return Promise.reject(error);
  }
);

export default axiosClient;