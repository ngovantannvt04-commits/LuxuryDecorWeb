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
    // Lấy token từ LocalStorage (chúng ta sẽ lưu nó ở đây khi login xong)
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
  (response) => response.data, // Trả về data luôn cho gọn
  (error) => {
    // Xử lý lỗi chung (VD: 401 Unauthorized)
    return Promise.reject(error);
  }
);

export default axiosClient;