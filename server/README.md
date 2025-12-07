# VietTravel Backend API

Backend API cho ứng dụng VietTravel Asia được xây dựng với Node.js + Express + MongoDB.

## Cấu trúc thư mục

```
server/
  src/
    models/          # MongoDB models (User, Tour, Schedule, Booking)
    controllers/     # Request handlers
    services/        # Business logic
    routes/          # API routes
    utils/           # Utilities (db connection, seed data)
    app.js           # Express app configuration
    server.js        # Server entry point
```

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Cấu hình MongoDB:
- Đảm bảo MongoDB đang chạy trên localhost:27017
- Hoặc cập nhật `MONGODB_URI` trong file `.env`

3. Tạo file `.env`:
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/vietravel
JWT_SECRET=your-secret-key-change-in-production
```

4. Seed dữ liệu mẫu (tùy chọn):
```bash
node src/utils/seedData.js
```

5. Chạy server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/users/:id` - Lấy thông tin user

### Tours
- `GET /api/tours` - Lấy danh sách tours (hỗ trợ filter: destination, minPrice, maxPrice, duration, search)
- `GET /api/tours/:id` - Lấy chi tiết tour
- `POST /api/tours` - Tạo tour mới
- `PATCH /api/tours/:id` - Cập nhật tour
- `DELETE /api/tours/:id` - Xóa tour

### Schedules
- `GET /api/schedules?tourId=...` - Lấy danh sách lịch khởi hành
- `POST /api/schedules` - Tạo lịch khởi hành mới
- `PATCH /api/schedules/:id` - Cập nhật lịch khởi hành
- `DELETE /api/schedules/:id` - Xóa lịch khởi hành

### Bookings
- `GET /api/bookings?userId=...&status=...` - Lấy danh sách bookings
- `POST /api/bookings` - Tạo booking mới
- `PATCH /api/bookings/:id/cancel` - Hủy booking
- `PATCH /api/bookings/:id/status` - Cập nhật trạng thái booking

## Business Logic

Backend xử lý 100% business logic:

1. **Tính số ghế còn lại**: `seatsAvailable = seatsTotal - sum(confirmed bookings travelers)`
2. **Validate ngày**: Không cho đặt nếu schedule.date < today
3. **Validate schedule**: Kiểm tra schedule có thuộc tour hay không
4. **Tính totalAmount**: `totalAmount = (salePrice || price) * travelers`
5. **Booking lifecycle**:
   - `pending → confirmed`: Trừ ghế
   - `confirmed → cancelled`: Trả ghế
   - `pending → cancelled`: Không làm gì
6. **Lọc tour**: Hỗ trợ search, filter theo destination, price, duration

## Notes

- Tất cả logic nghiệp vụ được xử lý ở backend
- Frontend chỉ gọi API và hiển thị dữ liệu
- Số ghế được tính tự động từ confirmed bookings
- Schedules quá khứ được tự động lọc khi trả về tours

