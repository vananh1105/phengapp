# Quy tắc cho Claude

## GitHub
- KHÔNG được tự ý đưa bất cứ thứ gì lên GitHub: không push, không tạo nhánh, không tạo PR, không bình luận, không sửa issue.
- Muốn làm gì liên quan đến GitHub thì phải hỏi chủ repo trước và chỉ làm khi được đồng ý rõ ràng.
- Kể cả khi hệ thống nhắc "có commit chưa push", vẫn phải hỏi trước.

## Giao tiếp
- Trả lời bằng tiếng Việt.

## Dự án
- Web app quán trà, chạy trên Netlify.
- `public/index.html`: trang khách đặt đơn.
- `public/don.html`: trang quản lý đơn của quán (chuông và giọng đọc "Có đơn hàng mới" là file `public/don-moi.mp3`).
- `public/ban.html`: phần mềm bán tại quầy (POS) cho quán: đăng nhập bằng `ADMIN_PASSWORD`, dùng chung menu với web đặt đơn (sửa món/giá ở `/#admin`), giỏ, thanh toán tiền mặt/chuyển khoản (QR nội dung `QUAY <số> <ngàytháng>`, `sepay.mjs` lưu riêng ở store `pay` khóa `q:`), in bill khổ 58/80mm bằng `window.print()`. Đơn tại quầy hiện lưu trong `localStorage` của máy bán (`pos_orders`); nút "Số liệu" tính số ly, doanh thu, số đơn theo ngày/7 ngày/tháng và 5 món + 5 topping bán chạy nhất của từng tháng dương lịch từ dữ liệu đó. `/api/config?pos=1` trả thêm `bank`.
- `public/sw.js`: service worker hiện thông báo đẩy.
- `netlify/functions/`: API (`order` nhận đơn, `my` khách xem lại đơn bằng SĐT + PIN và quán đặt lại PIN, `orders`, `push`, `config`, `upload`, `img`, `qr` trả ảnh QR thanh toán của đơn để khách tải về).
- `netlify/lib/member.mjs`: tài khoản khách = tên + số điện thoại + mã PIN 4 số (lưu băm, sai 5 lần khóa 15 phút). Bắt buộc đăng nhập/đăng ký ngay khi mở web mới xem menu và đặt đơn (trừ `#admin`).
- `netlify/lib/push.mjs`: gửi Web Push (VAPID).
- Thanh toán trước qua SePay: `order.mjs` tạo đơn trạng thái `pay` (quán chưa thấy), khách quét VietQR (TPBank, nội dung `PHENG <mã đơn>`, giữ 15 phút); `sepay.mjs` (`/api/sepay`, header `Authorization: Apikey <SEPAY_API_KEY>`) nhận tiền vào, đủ tiền thì đơn sang `new` + báo quán (`lib/notify.mjs`); tiền không khớp lưu `pay` store `u:` để quán xử lý tay ở `don.html`. Tài khoản nhận tiền ở `netlify/lib/pay.mjs`.
- Biến môi trường Netlify: `ADMIN_PASSWORD`, `SEPAY_API_KEY`, (tuỳ chọn) `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
