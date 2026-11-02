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
- `public/sw.js`: service worker hiện thông báo đẩy.
- `netlify/functions/`: API (`order` nhận đơn, `my` khách xem lại đơn bằng SĐT + PIN và quán đặt lại PIN, `orders`, `push`, `config`, `upload`, `img`).
- `netlify/lib/member.mjs`: tài khoản khách = tên + số điện thoại + mã PIN 4 số (lưu băm, sai 5 lần khóa 15 phút). Bắt buộc đăng nhập/đăng ký ngay khi mở web mới xem menu và đặt đơn (trừ `#admin`).
- `netlify/lib/push.mjs`: gửi Web Push (VAPID).
