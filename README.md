# Vị Việt — Web review ẩm thực Việt Nam

Website tĩnh (HTML/CSS/JS thuần) giúp khám phá quán ăn ngon ở Việt Nam dựa trên **điểm đánh giá kiểu Google Maps**. Chạy ngay bằng cách mở `index.html`, không cần cài đặt.

## Tính năng

- Dữ liệu mẫu ~24 quán tại 10 thành phố: Hà Nội, TP.HCM, Đà Nẵng, Huế, Hội An, Cần Thơ, Hải Phòng, Nha Trang, Đà Lạt, Nghệ An.
- Tìm kiếm theo tên quán, món ăn, địa chỉ, thành phố (không phân biệt dấu).
- Lọc theo thành phố, loại món, điểm tối thiểu; sắp xếp theo điểm, số review, tên, giá.
- Top 3 quán điểm cao nhất, danh sách yêu thích lưu trên trình duyệt.
- Trang chi tiết: địa chỉ, giờ mở cửa, món nên thử, đánh giá mẫu, liên kết trực tiếp tới Google Maps.
- **Viết review của bạn** (tên, 1–5 sao, cảm nhận) — lưu trong `localStorage`, có thể xóa.
- Chế độ **Google Maps API**: nhập key để tải quán thật có điểm ≥ 4.0 theo từng thành phố.

## Cách dùng

Mở `index.html` trong trình duyệt (Chrome/Edge/Firefox hiện đại).

> Nếu trình duyệt chặn `file://`, chạy một server tĩnh trong thư mục này:
> ```powershell
> python -m http.server 8080
> ```
> rồi truy cập `http://localhost:8080`.

## Lấy dữ liệu thật từ Google Maps

1. Vào [Google Cloud Console](https://console.cloud.google.com/) → tạo/chọn project.
2. Vào **APIs & Services → Library**, bật **Places API (New)**.
3. Vào **APIs & Services → Credentials → Create credentials → API key**.
4. (Khuyên dùng) Nhấn vào key → **Application restrictions = HTTP referrers** → thêm `http://localhost:*`, `https://your-domain.com/*`; **API restrictions = Select specific APIs → Places API (New)**.
5. Trong web, nhấn nút **⚙** ở góc trên phải → dán key → chọn thành phố và điểm tối thiểu → **Tải quán từ Google Maps**.
6. Chuyển sang tab **Google Maps** trên thanh điều hướng để xem dữ liệu đã tải.

Web dùng endpoint `POST https://places.googleapis.com/v1/places:searchText` với các tham số:

```json
{
  "textQuery": "nhà hàng quán ăn ngon ở Hà Nội, Việt Nam",
  "languageCode": "vi",
  "regionCode": "VN",
  "maxResultCount": 20,
  "minRating": 4.3,
  "locationBias": {
    "circle": {
      "center": { "latitude": 21.0278, "longitude": 105.8342 },
      "radius": 25000
    }
  }
}
```

Dữ liệu sau khi tải được lưu trong `localStorage` (`vi-viet-google-places-v1`) để dùng lại khi mở web lần sau. Nút **Xóa dữ liệu đã lưu** trong hộp thoại cấu hình sẽ xóa cache này.

### Lưu ý bảo mật

API key nhập ở đây nằm ở phía client (người dùng có thể thấy key trong trình duyệt). Đây là cách làm đơn giản cho web tĩnh/demo. Với sản phẩm thật, hãy đặt key ở server (proxy) và chỉ cho web gọi tới server của bạn.

## Cấu trúc file

| File | Vai trò |
| --- | --- |
| `index.html` | Giao diện chính, bộ lọc, hộp thoại chi tiết và cấu hình API |
| `styles.css` | Toàn bộ CSS, responsive 3 cột → 2 cột → 1 cột |
| `data.js` | Bộ dữ liệu quán mẫu, tọa độ trung tâm thành phố, icon món ăn |
| `app.js` | Lọc/sắp xếp, render, yêu thích, review người dùng, gọi Google Places API |

## Miễn trừ dữ liệu

Dữ liệu mẫu được biên soạn để minh họa giao diện theo cách Google Maps trình bày điểm đánh giá; điểm số và số lượt review là **tham khảo, không phải số liệu thời gian thực**. Để có số liệu chính xác, hãy dùng chế độ Google Maps API và tuân thủ [Điều khoản dịch vụ của Google Maps Platform](https://cloud.google.com/maps-platform/terms).
