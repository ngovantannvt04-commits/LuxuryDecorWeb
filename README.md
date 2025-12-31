# 🛋️ Luxury Decor – E-commerce Platform

> **Lưu ý:**  
> Dự án hiện đang trong quá trình phát triển tích cực (Active Development).  
> Một số tính năng có thể thay đổi hoặc đang được hoàn thiện.

## Giới thiệu

**Luxury Decor** là nền tảng thương mại điện tử chuyên cung cấp các sản phẩm nội thất cao cấp.

Dự án được xây dựng với kiến trúc hiện đại, tách biệt hoàn toàn Backend và Frontend, hướng tới:
- Trải nghiệm người dùng mượt mà
- Bảo mật cao
- Khả năng mở rộng tốt

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

### 🔧 Backend 

- Core: Java 17+, Spring Boot 3.x
- Database: PostgreSQL
- Security:
    - Spring Security
    - JWT (Access Token & Refresh Token Rotation)
    - BCrypt
- ORM: Spring Data JPA / Hibernate
- Mail Service: JavaMailSender (SMTP) + HTML Email Template
- Build Tool: Maven

### 🎨 Frontend
- Framework: Next.js 15 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- HTTP Client: Axios (Interceptor tự động xử lý Token)
- UI Components: Lucide React Icons

## ✨ Tính Năng Chính (Key Features)

#### 🔐 Identity Service (Xác thực & Phân quyền)

- Đăng ký tài khoản với xác thực Email OTP
- Đăng nhập bằng JWT
- Refresh Token Rotation – tự động cấp Access Token mới khi hết hạn
- Quên mật khẩu & Đặt lại mật khẩu qua Email
- Đăng xuất và thu hồi Token

#### 📧 Email Service

- Gửi Email OTP
- Gửi Email thông báo hệ thống
- Tên hiển thị thương hiệu: LuxuryDecor

#### 🎨 Giao diện người dùng (UI)

- Landing Page responsive
- Conditional Rendering theo trạng thái đăng nhập
- Form Login / Register tối giản, hiện đại

## 🗺️ Roadmap (Dự kiến phát triển)

- 👤 Quản lý hồ sơ người dùng (**User Profile**)
- 🗂️ Danh mục sản phẩm & Chi tiết sản phẩm
- 🛒 Giỏ hàng (**Shopping Cart**) & Thanh toán (**Checkout**)
- 💳 Tích hợp cổng thanh toán (**VNPay / Momo**)
- 🛠️ Admin Dashboard quản lý đơn hàng

## 🤝 Đóng Góp (Contributing)

Mọi đóng góp đều được hoan nghênh ❤️  
Nếu bạn muốn cải thiện hoặc mở rộng dự án, hãy làm theo các bước sau:

1. **Fork** dự án

2. **Tạo nhánh mới** cho tính năng hoặc sửa lỗi:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit thay đổi:**
   ```bash
   git commit -m "Add some AmazingFeature"
   ```
4. **Push lên Github:**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Mở Pull Request** để gửi đóng góp của bạn 🎉

## 📞 Liên Hệ

- **Developer:** Ngô Văn Tấn
- **Email:** ngovantannvt04@gmail.com
- **Project Link:** https://github.com/ngovantannvt04-commits/LuxuryDecorWeb.git

---

© 2025 **Luxury Decor**. All Rights Reserved.
