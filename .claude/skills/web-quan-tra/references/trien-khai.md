# Đưa web lên mạng (Netlify) và tiết kiệm credit

## Lần đầu cho quán mới

1. Repo GitHub mới chứa code (hỏi chủ quán trước khi tạo/đẩy).
2. Netlify: tạo site nối repo; `netlify.toml` có `publish = "public"`, `functions = "netlify/functions"`.
3. Biến môi trường trên Netlify: `ADMIN_PASSWORD` (mật khẩu quản lý), `SEPAY_API_KEY` (nếu dùng SePay), tuỳ chọn `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
4. SePay (kiểu 1): liên kết tài khoản ngân hàng, tạo webhook `https://<site>.netlify.app/api/sepay`, kiểu xác thực API Key; sửa `BANK`, `PREFIX` trong `netlify/lib/pay.mjs` cho đúng.
5. Sau khi web chạy, hướng dẫn chủ quán: vào `/#admin` nhập thông tin quán, logo, mã QR, link fanpage, menu, ảnh món; mở `don.html` trên điện thoại nhận đơn, đăng nhập và bật thông báo; thêm trang vào màn hình chính.

## Credit Netlify

- Mỗi lần đưa lên web thật (production deploy) tốn credit cho **mỗi site đang build**; link xem trước (deploy preview) miễn phí.
- Gom nhiều thay đổi rồi mới đưa lên web thật một lần; cho chủ quán thử bằng link xem trước trước.
- Nhiều site cùng nối một repo mà chỉ dùng một: thêm `ignore` trong `netlify.toml` theo `$SITE_NAME` để site không dùng khỏi build.
- Khi gửi link xem trước, nhắc: link xem trước dùng **chung dữ liệu thật** (tài khoản khách, đơn, menu); không chuyển khoản thật để thử.

## Quy trình mỗi lần sửa

1. Sửa trên nhánh làm việc, tự thử, commit.
2. Hỏi chủ quán "đưa lên chưa?". Đồng ý thì push và mở PR để có link xem trước.
3. Chủ quán thử xong, nói "gộp lên web thật" thì mới gộp PR.
4. Báo lại: commit đã gộp, credit ước tính, việc chủ quán cần làm, commit cũ để quay lại nếu lỗi.
