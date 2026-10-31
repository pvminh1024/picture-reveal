# 🌟 LẬT MẢNH GHÉP BÍ ẨN – ĐOÁN CHỦ ĐỀ (GAMESHOW WEB APP)

Ứng dụng web trò chơi tương tác chuyên nghiệp phục vụ trình chiếu trong hội trường, sự kiện, sinh hoạt chi đoàn, teambuilding, lớp học với người dẫn chương trình (MC) điều khiển trực tiếp trên màn hình lớn / máy chiếu (tỷ lệ chuẩn 16:9).

---

## 🚀 Công nghệ sử dụng

- **React 19 + TypeScript**: Đảm bảo an toàn kiểu dữ liệu, hiệu năng cao, logic tách bạch.
- **Vite 6**: Khởi động siêu nhanh, đóng gói tối ưu.
- **Tailwind CSS v4**: Hệ thống giao diện hiện đại phong cách gameshow truyền hình (Navy Blue & Gold Accent).
- **Motion (`motion/react`)**: Hiệu ứng lật mở 3D mảnh ghép, hiệu ứng chuyển cảnh, modal popups mượt mà.
- **Canvas Confetti**: Pháo hoa chúc mừng chiến thắng hoành tráng.
- **Web Audio API**: Âm thanh gameshow sống động (đúng, sai, lật mở, fanfare chiến thắng, hết lượt) được tổng hợp bằng mã lệnh, **chạy 100% offline không cần file mp3 hay internet**.
- **LocalStorage**: Tự động lưu tiến trình và cấu hình câu hỏi, không sợ mất dữ liệu khi vô tình F5.

---

## 📋 Cấu trúc thư mục

```
game-shcd-t11/
├── src/
│   ├── components/
│   │   ├── ConfirmModal.tsx      # Hộp thoại xác nhận (Reset, Về trang chủ, Công bố)
│   │   ├── GameControls.tsx      # Thanh công cụ điều khiển của MC (Pause, Sound, Fullscreen, Reset...)
│   │   ├── GamePage.tsx          # Màn hình gameshow chính
│   │   ├── PuzzleBoard.tsx       # Bàn cờ 3x3 chứa ảnh chủ đề và 9 mảnh ghép
│   │   ├── PuzzleTile.tsx        # Từng mảnh ghép với hiệu ứng lật mở 3D / khóa ô
│   │   ├── QuestionModal.tsx     # Popup hiển thị câu hỏi và 4 đáp án A, B, C, D
│   │   ├── SetupPage.tsx         # Trang thiết lập của ban tổ chức (Admin Setup)
│   │   ├── Toast.tsx             # Thông báo trạng thái đồng bộ
│   │   ├── TopicGuessModal.tsx   # Popup đoán từ khóa chủ đề & trợ lý so khớp
│   │   └── VictoryScreen.tsx     # Màn hình vinh danh chiến thắng & pháo hoa
│   ├── data/
│   │   └── demoData.ts           # Dữ liệu mẫu 9 câu hỏi tiếng Việt & ảnh chủ đề SVG offline
│   ├── store/
│   │   └── gameStore.ts          # Quản trị trạng thái tập trung (Context + LocalStorage)
│   ├── types/
│   │   └── game.ts               # Định nghĩa kiểu dữ liệu TypeScript chuẩn
│   ├── utils/
│   │   └── sounds.ts             # Bộ tạo âm thanh chuẩn Web Audio API offline
│   ├── App.tsx                   # Điều hướng chính
│   ├── index.css                 # Import Tailwind CSS
│   └── main.tsx                  # Điểm khởi chạy React
├── package.json
└── vite.config.ts
```

---

## 💻 Hướng dẫn chạy và cài đặt

### 1. Cài đặt thư viện
Mở Terminal trong thư mục dự án và chạy:
```bash
npm install
```

### 2. Chạy môi trường phát triển (Development)
```bash
npm run dev
```
Truy cập trình duyệt tại địa chỉ hiển thị (thường là `http://localhost:5173`).

### 3. Đóng gói để chạy offline trên Laptop / Máy chiếu (Production Build)
```bash
npm run build
```
Sau đó bạn có thể chạy thử bản build:
```bash
npm run preview
```
Bản build nằm gọn trong thư mục `dist/`, hoàn toàn tự chứa (self-contained) và có thể mang đi trình chiếu mà không cần kết nối mạng Internet.

---

## 🎮 Hướng dẫn sử dụng cho Ban tổ chức & MC

### 1. Màn hình thiết lập (Admin Setup)
- **Nạp nhanh dữ liệu mẫu**: Nhấn nút **"Dữ liệu mẫu"** ở góc phải để nạp ngay bộ 9 câu hỏi tìm hiểu về Đất nước - Con người Việt Nam cùng hình ảnh chủ đề chất lượng cao.
- **Tải ảnh chủ đề từ máy tính**: Nhấp vào khung tải ảnh để chọn file ảnh bất kỳ (.png, .jpg, .webp).
- **Nhập từ khóa chủ đề**: Gõ đáp án mà các đội chơi cần giải mã.
- **Biên tập 9 câu hỏi**:
  - Nhập nội dung câu hỏi và 4 phương án A, B, C, D.
  - Chọn nút tròn radio ở phương án đúng tương ứng.
  - Có nút thùng rác để xóa nhanh câu hỏi cần làm lại.
- **Xuất / Nhập JSON**: Cho phép lưu cấu hình ra file `.json` để tái sử dụng cho các buổi sinh hoạt khác nhau.
- **Bắt đầu trò chơi**: Hệ thống kiểm tra hợp lệ và chuyển sang màn hình Gameshow.

### 2. Màn hình trò chơi (Gameshow)
- **Khu vực trung tâm**: Ảnh chủ đề nằm ẩn bên dưới chính xác 9 mảnh ghép đánh số từ 1 đến 9.
- **Khi MC nhấp vào một mảnh ghép**:
  - Mở câu hỏi dạng thẻ lớn, rõ nét cho cả hội trường quan sát.
  - **Nếu trả lời sai**: Nút đáp án chuyển sang màu đỏ, kèm âm thanh cảnh báo, đáp án sai bị khóa không cho chọn lại. Đội chơi được phép thử tiếp (tối đa 3 lần).
  - **Nếu trả lời đúng**: Nút chuyển màu xanh ngọc, thông báo "CHÍNH XÁC! 🎉", phát âm thanh tươi vui và mảnh ghép lật mở 3D làm lộ phần ảnh bên dưới.
  - **Nếu sai cả 3 lần**: Thông báo "HẾT LƯỢT! 🔒", không tiết lộ đáp án đúng, mảnh ghép bị khóa lại và không thể chọn lại.
- **Đoán chủ đề**:
  - Nhấn nút **🎯 ĐOÁN CHỦ ĐỀ** bất kỳ lúc nào.
  - Nhập tên đội và đáp án của đội đó.
  - Có nút **"Kiểm tra"** hỗ trợ MC so sánh tự động (không phân biệt hoa thường, dấu tiếng Việt).
  - MC nhấn **"ĐÚNG ✓"** hoặc **"SAI ✗"** để quyết định.
  - Khi đoán đúng: **Toàn bộ mảnh ghép còn lại lần lượt lật mở**, hình ảnh hoàn chỉnh lộ ra, công bố từ khóa chữ lớn, pháo hoa confetti rực rỡ và phát nhạc chiến thắng!

### 3. Thanh công cụ hỗ trợ MC
- ⏸️ **Tạm dừng / Tiếp tục**: Đóng băng giao diện khi cần phổ biến luật hoặc hội ý.
- 🔊 **Bật / Tắt âm thanh**: Linh hoạt điều chỉnh âm lượng trong hội trường.
- ⛶ **Toàn màn hình**: Tối ưu hiển thị vừa khít máy chiếu 16:9, không bị tràn viền.
- 👁️ **Công bố**: Cho phép MC chủ động mở ảnh chủ đề khi hết giờ hoặc theo kịch bản.
- 🔄 **Reset**: Đặt lại lượt chơi hiện tại (có hộp thoại xác nhận an toàn).
- 🏠 **Về trang chủ**: Quay về màn hình cấu hình mà **vẫn giữ nguyên bộ câu hỏi đã nhập** để MC dễ dàng chỉnh sửa.
