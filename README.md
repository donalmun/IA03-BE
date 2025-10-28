# User Registration Backend API

Đây là backend API cho hệ thống đăng ký người dùng, được xây dựng bằng [NestJS](https://nestjs.com/), một framework Node.js tiên tiến để xây dựng các ứng dụng server-side hiệu quả và có khả năng mở rộng.

## Tính năng

- Endpoint đăng ký người dùng (`/user/register`)
- Validation dữ liệu đầu vào (email, password)
- Mã hóa mật khẩu bằng bcrypt
- Xử lý lỗi (ví dụ: email đã tồn tại)
- Tích hợp Docker để dễ dàng cài đặt và chạy ở môi trường local.

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

- **POST** `/user/register`
  - **Body:**
    ```json
    {
      "email": "test@example.com",
      "password": "password123"
    }
    ```
  - **Success Response (201):**
    ```json
    {
      "email": "test@example.com",
      "createdAt": "...",
      "updatedAt": "...",
      "_id": "...",
      "__v": 0
    }
    ```
  - **Error Response (400 - Bad Request):**
    ```json
    {
      "message": ["Password must be at least 8 characters."],
      "error": "Bad Request",
      "statusCode": 400
    }
    ```
  - **Error Response (409 - Conflict):**
    ```json
    {
      "message": "Email already in use.",
      "error": "Conflict",
      "statusCode": 409
    }
    ```
