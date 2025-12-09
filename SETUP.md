# 🚀 Hướng Dẫn Setup và Chạy Dự Án VietTravel Asia

## 📋 Mục Lục

1. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
2. [Cài Đặt MongoDB](#cài-đặt-mongodb)
3. [Setup Backend](#setup-backend)
4. [Setup Frontend](#setup-frontend)
5. [Chạy Dự Án](#chạy-dự-án)
6. [Kiểm Tra](#kiểm-tra)
7. [Troubleshooting](#troubleshooting)

---

## 📦 Yêu Cầu Hệ Thống

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:

- **Node.js** (phiên bản 16.x trở lên)
- **npm** hoặc **yarn**
- **MongoDB** (local hoặc MongoDB Atlas)
- **Git** (để clone dự án)

### Kiểm tra phiên bản:

```bash
node --version    # Nên >= 16.x
npm --version     # Nên >= 8.x
mongod --version  # Nếu cài MongoDB local
```

---

## 🗄️ Cài Đặt MongoDB

### Option 1: MongoDB Local (Windows)

1. **Tải MongoDB Community Server:**
   - Truy cập: https://www.mongodb.com/try/download/community
   - Chọn Windows và tải về

2. **Cài đặt MongoDB:**
   - Chạy file installer
   - Chọn "Complete" installation
   - Đánh dấu "Install MongoDB as a Service"
   - Chọn "Run service as Network Service user"

3. **Khởi động MongoDB:**
   ```bash
   # MongoDB sẽ tự động chạy như một service
   # Hoặc chạy thủ công:
   mongod
   ```

4. **Kiểm tra MongoDB đang chạy:**
   ```bash
   # Mở terminal mới và chạy:
   mongosh
   # Nếu kết nối thành công, bạn sẽ thấy MongoDB shell
   ```

### Option 2: MongoDB Atlas (Cloud - Miễn phí)

1. **Tạo tài khoản MongoDB Atlas:**
   - Truy cập: https://www.mongodb.com/cloud/atlas
   - Đăng ký tài khoản miễn phí

2. **Tạo Cluster:**
   - Chọn "Build a Database" → "Free" tier
   - Chọn region gần nhất (ví dụ: Singapore)
   - Đặt tên cluster (ví dụ: `vietravel-cluster`)

3. **Tạo Database User:**
   - Vào "Database Access" → "Add New Database User"
   - Username: `vietravel_user`
   - Password: Tạo password mạnh (lưu lại!)
   - Role: `Atlas admin`

4. **Whitelist IP:**
   - Vào "Network Access" → "Add IP Address"
   - Chọn "Allow Access from Anywhere" (0.0.0.0/0) cho development
   - Hoặc thêm IP cụ thể của bạn

5. **Lấy Connection String:**
   - Vào "Database" → "Connect" → "Connect your application"
   - Copy connection string, ví dụ:
   ```
   mongodb+srv://vietravel_user:<password>@vietravel-cluster.xxxxx.mongodb.net/vietravel?retryWrites=true&w=majority
   ```
   - Thay `<password>` bằng password bạn đã tạo

---

## 🔧 Setup Backend

### Bước 1: Di chuyển vào thư mục server

```bash
cd server
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Tạo file `.env`

Tạo file `.env` trong thư mục `server/` với nội dung:

**Nếu dùng MongoDB Local:**
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/vietravel
JWT_SECRET=your-secret-key-change-in-production-123456
```

**Nếu dùng MongoDB Atlas:**
```env
PORT=4000
MONGODB_URI=mongodb+srv://vietravel_user:YOUR_PASSWORD@vietravel-cluster.xxxxx.mongodb.net/vietravel?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-change-in-production-123456
```

> ⚠️ **Lưu ý:** 
> - Thay `YOUR_PASSWORD` bằng password MongoDB Atlas của bạn
> - Thay connection string bằng connection string thực tế từ Atlas
> - Đổi `JWT_SECRET` thành một chuỗi ngẫu nhiên mạnh trong production

### Bước 4: Seed dữ liệu mẫu (Tùy chọn)

Chạy script để tạo dữ liệu mẫu (users, tours, schedules):

```bash
npm run seed
```

Kết quả mong đợi:
```
✅ MongoDB Connected: ...
📊 Database: vietravel
Cleared existing data
Seeded users
Seeded tours
Seeded schedules
Seed data completed successfully!
```

**Dữ liệu mẫu được tạo:**
- **User Customer:**
  - Email: `linh@demo.com`
  - Password: `123456`
  
- **User Admin:**
  - Email: `admin@vietravelasia.com`
  - Password: `admin123`

- **Tour:** Sapa Heritage Retreat 4N3Đ
- **Schedules:** 3 lịch khởi hành mẫu

### Bước 5: Kiểm tra backend

```bash
npm run check
```

Kết quả mong đợi:
```
✅ Backend is running!
📡 Response: { status: 'OK', message: 'VietTravel API is running' }
```

---

## 🎨 Setup Frontend

### Bước 1: Di chuyển vào thư mục client

```bash
cd ../client
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Tạo file `.env` (Tùy chọn)

Nếu backend chạy trên port khác 4000, tạo file `.env` trong thư mục `client/`:

```env
VITE_API_URL=http://localhost:4000
```

> ⚠️ **Lưu ý:** Nếu backend chạy trên port 4000 (mặc định), bạn không cần tạo file này.

---

## 🚀 Chạy Dự Án

### Cách 1: Chạy riêng biệt (Khuyến nghị cho development)

#### Terminal 1 - Backend:

```bash
cd server
npm run dev
```

Kết quả mong đợi:
```
✅ MongoDB Connected: localhost
📊 Database: vietravel
🚀 Server is running on port 4000
🔗 Health check: http://localhost:4000/api/health
```

#### Terminal 2 - Frontend:

```bash
cd client
npm run dev
```

Kết quả mong đợi:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Cách 2: Chạy song song (Windows PowerShell)

Tạo file `start-dev.ps1` ở root dự án:

```powershell
# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm run dev"

# Wait 3 seconds
Start-Sleep -Seconds 3

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev"
```

Chạy:
```powershell
.\start-dev.ps1
```

---

## ✅ Kiểm Tra

### 1. Kiểm tra Backend

Mở trình duyệt hoặc dùng curl:

```bash
# Kiểm tra health endpoint
curl http://localhost:4000/api/health

# Hoặc mở trình duyệt:
# http://localhost:4000/api/health
```

Kết quả mong đợi:
```json
{
  "status": "OK",
  "message": "VietTravel API is running"
}
```

### 2. Kiểm tra Frontend

Mở trình duyệt:
```
http://localhost:5173
```

Bạn sẽ thấy trang chủ VietTravel Asia.

### 3. Kiểm tra kết nối Frontend - Backend

1. Mở Developer Tools (F12)
2. Vào tab **Network**
3. Thực hiện một action (ví dụ: xem danh sách tours)
4. Kiểm tra request đến `http://localhost:4000/api/...` thành công

### 4. Test đăng nhập

1. Vào trang đăng nhập
2. Thử đăng nhập với:
   - Email: `linh@demo.com`
   - Password: `123456`

---

## 🔍 Troubleshooting

### Lỗi: "Cannot connect to MongoDB"

**Nguyên nhân:**
- MongoDB chưa được khởi động
- Connection string sai
- Firewall chặn kết nối

**Giải pháp:**

1. **Kiểm tra MongoDB đang chạy:**
   ```bash
   # Windows
   # Kiểm tra service MongoDB
   services.msc
   # Tìm "MongoDB" và đảm bảo đang "Running"
   ```

2. **Kiểm tra connection string:**
   - Xem lại file `.env` trong `server/`
   - Đảm bảo `MONGODB_URI` đúng format
   - Nếu dùng Atlas, kiểm tra password và whitelist IP

3. **Test kết nối MongoDB:**
   ```bash
   # Local MongoDB
   mongosh mongodb://localhost:27017/vietravel
   
   # Hoặc
   mongosh
   use vietravel
   ```

### Lỗi: "Port 4000 already in use"

**Giải pháp:**

1. **Tìm process đang dùng port 4000:**
   ```bash
   # Windows
   netstat -ano | findstr :4000
   ```

2. **Kill process:**
   ```bash
   # Thay <PID> bằng Process ID từ bước trên
   taskkill /PID <PID> /F
   ```

3. **Hoặc đổi port trong `.env`:**
   ```env
   PORT=4001
   ```
   Và cập nhật `VITE_API_URL` trong frontend `.env`

### Lỗi: "Module not found" hoặc "Cannot find module"

**Giải pháp:**

```bash
# Xóa node_modules và cài lại
cd server
rm -rf node_modules package-lock.json
npm install

cd ../client
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: Frontend không kết nối được Backend

**Nguyên nhân:**
- Backend chưa chạy
- CORS issue
- API URL sai

**Giải pháp:**

1. **Kiểm tra backend đang chạy:**
   ```bash
   curl http://localhost:4000/api/health
   ```

2. **Kiểm tra `VITE_API_URL` trong frontend:**
   - Xem file `.env` trong `client/`
   - Hoặc kiểm tra `client/src/apis/*.js` có đúng URL không

3. **Kiểm tra CORS:**
   - Backend đã có `cors()` middleware trong `app.js`
   - Nếu vẫn lỗi, kiểm tra browser console

### Lỗi: "JWT_SECRET is not defined"

**Giải pháp:**

Đảm bảo file `.env` trong `server/` có:
```env
JWT_SECRET=your-secret-key-change-in-production-123456
```

### Lỗi: Seed data thất bại

**Nguyên nhân:**
- MongoDB chưa kết nối
- Dữ liệu đã tồn tại

**Giải pháp:**

1. **Xóa database và seed lại:**
   ```bash
   mongosh
   use vietravel
   db.dropDatabase()
   exit
   
   # Sau đó chạy lại seed
   cd server
   npm run seed
   ```

---

## 📝 Scripts Hữu Ích

### Backend Scripts:

```bash
cd server

npm start          # Chạy production
npm run dev        # Chạy development (với nodemon)
npm run seed       # Seed dữ liệu mẫu
npm run check      # Kiểm tra backend đang chạy
```

### Frontend Scripts:

```bash
cd client

npm run dev        # Chạy development server
npm run build      # Build production
npm run preview    # Preview production build
npm run lint       # Chạy ESLint
```

---

## 🎯 Bước Tiếp Theo

Sau khi setup thành công:

1. ✅ Khám phá các tính năng:
   - Xem danh sách tours
   - Xem chi tiết tour
   - Đặt tour (booking)
   - Dashboard quản lý booking

2. ✅ Test với tài khoản Admin:
   - Email: `admin@vietravelasia.com`
   - Password: `admin123`
   - Có thể tạo/sửa/xóa tours và schedules

3. ✅ Đọc tài liệu API:
   - Xem `server/README.md` để biết chi tiết API endpoints

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. Kiểm tra lại các bước setup
2. Xem phần Troubleshooting
3. Kiểm tra console logs (backend và frontend)
4. Kiểm tra MongoDB connection
5. Xem file `PROJECT_STATUS.md` để biết trạng thái dự án

---

**Chúc bạn setup thành công! 🎉**

