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
    // Lấy token từ hoặc localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Xử lý sau khi nhận Response (Nơi xử lý Refresh Token sau này)
axiosClient.interceptors.response.use(
  (response) => response.data, // Trả về data 
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 403/401 và chưa từng thử lại request này (tránh vòng lặp vô tận)
    if (error.response && (error.response.status === 403 || error.response.status === 401) && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu đã thử lại

      try {
        // 1. Lấy refresh token từ storage
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
            throw new Error("No refresh token available");
        }

        // 2. Gọi API để lấy token mới (Sửa URL này theo đúng backend của bạn)
        // Lưu ý: Dùng axios thường, không dùng axiosClient để tránh bị interceptor chặn tiếp
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            refreshToken: refreshToken
        });

        const { accessToken } = res.data; // Giả sử backend trả về { accessToken: "..." }

        // 3. Lưu token mới
        localStorage.setItem('accessToken', accessToken);

        // 4. Gắn token mới vào header của request bị lỗi ban đầu
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // 5. Thực hiện lại request ban đầu
        return axiosClient(originalRequest);

      } catch (refreshError) {
        // Nếu Refresh cũng lỗi (hết hạn cả 2 token) -> Buộc phải logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
             window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;