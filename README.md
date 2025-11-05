# User Registration & Authentication API

Đây là backend API cho một hệ thống xác thực người dùng hoàn chỉnh, được xây dựng bằng [NestJS](https://nestjs.com/), một framework Node.js tiên tiến để xây dựng các ứng dụng server-side hiệu quả và có khả năng mở rộng.

## Tính năng Chính

- **Đăng ký & Đăng nhập:** Endpoint để tạo tài khoản và đăng nhập.
- **Xác thực bằng JWT:** Sử dụng JSON Web Tokens với cặp Access Token (ngắn hạn) và Refresh Token (dài hạn).
- **Lưu trữ Refresh Token an toàn:** Refresh token được lưu trong database và được thu hồi khi logout.
- **Bảo mật với `httpOnly` Cookies:** Refresh token được gửi về client qua `httpOnly` cookie để chống lại tấn công XSS.
- **Bảo vệ Endpoint:** Sử dụng NestJS Guards để bảo vệ các route yêu cầu xác thực.
- **Phân quyền dựa trên Vai trò (RBAC):** Cung cấp các endpoint chỉ dành cho `admin`.
- **Mã hóa Mật khẩu:** Mật khẩu được hash an toàn bằng `bcrypt`.
- **Validation:** Dữ liệu đầu vào được kiểm tra chặt chẽ bằng `class-validator`.
- **Tích hợp Docker:** Cấu hình sẵn `docker-compose` để dễ dàng khởi chạy toàn bộ môi trường (API + MongoDB).

---

## Cài đặt và Chạy ứng dụng

Có hai cách để chạy dự án này ở môi trường local:

### 1. Sử dụng Docker (Khuyến nghị)

Đây là cách đơn giản và nhanh nhất để khởi chạy toàn bộ môi trường

**Yêu cầu:**

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/) (thường được cài đặt sẵn cùng Docker Desktop)

**Các bước thực hiện:**

1.  **Tạo file biến môi trường:**
    Sao chép file `.env.example` thành một file mới tên là `.env`.

    ```bash
    cp .env.example .env
    ```

    _Bạn có thể tùy chỉnh các biến trong file `.env` nếu muốn, nhưng các giá trị mặc định đã được cấu hình để hoạt động với Docker Compose._

2.  **Khởi chạy các services:**
    Chạy lệnh sau từ thư mục `back-end`. Docker sẽ tự động build image cho API.

    ```bash
    docker-compose up --build -d
    ```

    - `--build`: Bắt buộc build lại image nếu có thay đổi trong `Dockerfile`.
    - `-d`: Chạy ở chế độ "detached" (chạy ngầm).

3.  **Kiểm tra:**
    API sẽ chạy tại `http://localhost:3000`.

4.  **Để dừng các services:**
    ```bash
    docker-compose down
    ```

### 2. Cài đặt thủ công

Sử dụng cách này nếu bạn không muốn dùng Docker và đã có sẵn Node.js, npm, và một instance MongoDB đang chạy.

**Yêu cầu:**

- Node.js (v18 trở lên)
- npm
- MongoDB (đang chạy ở local hoặc một chuỗi kết nối từ MongoDB Atlas)

**Các bước thực hiện:**

1.  **Cài đặt dependencies:**

    ```bash
    npm install
    ```

2.  **Tạo và cấu hình file `.env`:**
    Tạo một file `.env` và thêm vào biến môi trường `MONGODB_URI`.
    ```bash
    cp .env.example .env
    ```
    Chạy chế độ development:
    ```bash
    npm run start:dev
    ```
    API sẽ chạy tại `http://localhost:3000` và sẽ tự động khởi động lại khi có thay đổi trong source code.

---

## API Endpoints

### `/auth`

- **POST** `/auth/login`
  - **Body:** `{ "email": "...", "password": "..." }`
  - **Success Response (200):**
    - Trả về JSON: `{ "access_token": "..." }`
    - Set `refresh_token` trong một `httpOnly` cookie.

- **POST** `/auth/refresh`
  - **Body:** (Rỗng) - Gửi `refresh_token` qua cookie.
  - **Success Response (200):** Trả về `{ "access_token": "..." }` mới.

- **POST** `/auth/logout`
  - **Body:** (Rỗng) - Gửi `refresh_token` qua cookie.
  - **Success Response (200):** Trả về `{ "message": "Logged out successfully" }` và xóa cookie.

### `/user`

- **POST** `/user/register`
  - **Body:** `{ "email": "...", "password": "..." }`
  - **Success Response (201):** Trả về thông tin user đã được tạo (không bao gồm password).

- **GET** `/user/me`
  - **Yêu cầu:** Cần Access Token (đã đăng nhập).
  - **Success Response (200):** Trả về thông tin của user hiện tại (`{ userId, email, role }`).

- **GET** `/user/all`
  - **Yêu cầu:** Cần Access Token VÀ user phải có vai trò `admin`.
  - **Success Response (200):** Trả về danh sách tất cả người dùng trong hệ thống.
