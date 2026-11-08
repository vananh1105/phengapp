# Chức năng và cách bật/tắt

Bản mẫu (code O Sugar) gồm:

| File | Vai trò |
|---|---|
| `public/index.html` | Trang khách đặt đơn + `/#admin` (chủ quán tự sửa thông tin, menu, ảnh, giá, topping) |
| `public/don.html` | Trang quản lý đơn: cột Mới / Đang làm / Xong, chuông + giọng đọc `don-moi.mp3`, bật thông báo đẩy |
| `public/sw.js` | Service worker hiện thông báo đẩy |
| `netlify/functions/order.mjs` | Nhận đơn (`/api/order`) |
| `netlify/functions/orders.mjs` | Quán xem/đổi trạng thái đơn |
| `netlify/functions/my.mjs` | Khách xem lại đơn và thẻ tích điểm bằng SĐT + PIN |
| `netlify/functions/sepay.mjs` | Nhận báo tiền vào từ SePay |
| `netlify/functions/config.mjs` | Lưu/đọc cấu hình quán (menu, thông tin) |
| `netlify/functions/upload.mjs`, `img.mjs` | Tải ảnh lên / trả ảnh |
| `netlify/functions/push.mjs`, `netlify/lib/push.mjs` | Đăng ký và gửi thông báo đẩy (VAPID tự tạo, lưu trong Blobs) |
| `netlify/functions/qr.mjs` | Ảnh QR thanh toán của đơn để khách tải về |
| `netlify/lib/member.mjs` | Tài khoản khách, PIN, thẻ tích điểm |
| `netlify/lib/pay.mjs` | Tài khoản nhận tiền, thời gian giữ đơn, mã đơn |
| `netlify/lib/notify.mjs` | Báo quán có đơn: thông báo đẩy + Telegram |

Dữ liệu lưu trong Netlify Blobs: `shop` (cấu hình), `orders`, `pay`, `members`, `push`, `img`.

## 1. Tài khoản khách

- **SĐT + PIN 4 số (mặc định):** bắt buộc đăng nhập mới xem menu; PIN lưu băm, sai 5 lần khoá 15 phút (`member.mjs`). Cần cho thẻ tích điểm và xem lại đơn.
- **Chỉ tên + SĐT:** bỏ màn hình đăng nhập (`#gate`) trong `index.html`, bỏ `checkPin` trong `order.mjs`. Khi đó **tắt thẻ tích điểm** (không có PIN thì ai cũng lấy dấu của người khác được) — báo chủ quán điều này.

## 2. Thanh toán (chọn một hoặc nhiều; nhiều thì khách chọn trong giỏ)

**Kiểu 1 · SePay tự xác nhận (bản mẫu đang dùng)**
- `order.mjs` tạo đơn trạng thái `pay` (quán chưa thấy), khách quét VietQR nội dung `<PREFIX> <mã đơn>`, giữ `PAY_MIN` phút.
- `sepay.mjs` nhận tiền (header `Authorization: Apikey <SEPAY_API_KEY>`), đủ tiền thì đơn sang `new` + báo quán; tiền không khớp lưu `pay` khoá `u:` để quán xử lý tay.
- Cần: tài khoản SePay liên kết ngân hàng, webhook trỏ về `https://<site>/api/sepay`.

**Kiểu 2 · Chỉ QR, quán tự kiểm tiền**
- `order.mjs` tạo đơn `new` ngay, thêm `paid:0`, trả thông tin QR như kiểu 1 (không cần SePay).
- Báo quán ngay khi tạo đơn (`notifyNewOrder`).
- `don.html`: đơn có nhãn "Chưa kiểm tiền" + nút **Đã nhận tiền** (đặt `paid:1`).

**Kiểu 3 · Trả khi nhận**
- Tạo đơn `new` ngay, không QR; giỏ hàng ghi "Thanh toán khi nhận hàng".

**Kiểu 4 · Gửi đơn qua Zalo**
- Khách bấm **Gửi đơn qua Zalo**: web lưu đơn (`new`, `src:'zalo'`, có chuông báo), chép nội dung đơn vào bộ nhớ (`navigator.clipboard.writeText`), rồi mở `https://zalo.me/<số Zalo quán>`; hiện hướng dẫn "dán và gửi". Zalo không cho điền sẵn tin nhắn nên khách phải tự dán.
- `don.html`: đơn có nhãn **Zalo** và 2 ô tích **Hoàn thành** (sang cột Xong) / **Huỷ** (sang mục Đã huỷ, trạng thái `cancel`). Bỏ tích để mở lại đơn bấm nhầm. `orders.mjs` phải chấp nhận thêm trạng thái `cancel`.
- Đơn huỷ **không tính** doanh thu, số ly, không cộng dấu.

**Thẻ tích điểm với kiểu 2/3/4:** cộng dấu khi quán bấm Đã nhận tiền / Hoàn thành (gọi `addStamps` trong `orders.mjs`), không cộng lúc tạo đơn.

## 3. Cách nhận hàng (bật một hoặc nhiều)

- **Nhận tại quán.**
- **Giao tận nơi:** khách gõ địa chỉ (bắt buộc), web nhớ địa chỉ cũ (`localStorage` `ship_loc`); dưới ô có ghi chú "Quán sẽ đặt tài xế Grab, Xanh SM, Ahamove hoặc Shopee để giao". `order.mjs` lưu `addr`; `don.html` có nút Xem bản đồ / Chỉ đường mở Google Maps theo địa chỉ.
- **Khách tự đặt ship:** không cần địa chỉ; nhắc khách đặt tài xế đến lấy tại địa chỉ quán và báo mã đơn. Đơn ghi dòng `Khách tự đặt ship…`, thông báo đẩy ghi "khách tự đặt ship".
- Nút chọn là 2–3 ô to có biểu tượng + chữ đậm + dòng giải thích nhỏ, ô đang chọn tô màu chủ đạo và có dấu ✓. Không chọn sẵn; chưa chọn thì nhắc khách chọn.
- **Không làm bản đồ đo km** trừ khi chủ quán yêu cầu rõ (O Sugar đã bỏ vì lỗi trùng `id`). Nếu làm lại, đặt `id` riêng và thử kỹ.

## 4. Thẻ tích điểm "mua N ly tặng 1"

- `STAMP_GOAL` trong `member.mjs` (O Sugar = 10). Mỗi ly 1 dấu (`cupsOf` đếm dòng `- <số> ×`).
- Giỏ có ô "Dùng 1 ly miễn phí" khi đủ dấu (miễn phí ly đắt nhất, gửi `free:1`, máy chủ kiểm tra lại).
- **Tích điểm tại quán:** trang quản lý có nút "🐾 Tích điểm tại quán": nhập SĐT khách đã có tài khoản web → cộng dấu theo số ly, đủ dấu thì đổi 1 ly miễn phí (bấm 2 lần xác nhận). Máy chủ: `/api/my` `{phone, stamp:"get"|"add"|"use", cups}` + mật khẩu quản lý; lịch sử ghi "Mua tại quán".
- Thẻ hiện trong khung "Đơn đã đặt" (thẻ, dòng nhắc, lịch sử); đủ dấu có pháo giấy. Màu thẻ, hình dấu (dấu chân, ngôi sao, trái tim…) làm theo giao diện của quán.

## 5. Nhãn món (chủ quán bật trong `/#admin` → Sửa món)

`b` Best seller · `nw` Món mới · `tr` Nên thử · `off` Tạm hết món. Nhãn xếp chồng ở góc ảnh, mỗi nhãn một màu.

## 6. Báo đơn mới cho quán

- Chuông + giọng đọc "Có đơn hàng mới" trên `don.html`, nền nhấp nháy, khung "CÓ ĐƠN MỚI!".
- Thông báo đẩy kiểu: tiêu đề "🔔 CÓ ĐƠN MỚI! #<mã>", nội dung tiền · số ly · cách nhận (không có tên, SĐT khách). Push không mang dữ liệu; `sw.js` lấy tóm tắt qua `GET /api/push?last=1` bằng mật khẩu quản lý lưu trong IndexedDB.
- Telegram (tuỳ chọn): biến `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

## 7. Lưu ý trong giỏ hàng

Mặc định: "Quán không nhận đơn gấp qua web. Nếu cần gấp, nhắn quán qua trang fanpage" (link `info.fb` nhập ở `/#admin`). Câu chữ đổi theo quán.

## 8. Menu luôn mới (hết món, đổi giá)

- Trang đặt đơn tải lại `/api/config` mỗi 20 giây khi đang mở, khi khách quay lại trang và ngay trước khi gửi đơn (`refreshCfg`, `cartCheck`).
- Món/topping vừa hết thì bỏ khỏi giỏ, giá vừa đổi thì cập nhật; hiện khung đỏ "Menu vừa thay đổi"; giữ địa chỉ, ghi chú, cách nhận hàng (`reCart`).
- Đơn gửi kèm `items:[{n,p,t,q}]`; `order.mjs` so với menu trên máy chủ, sai thì trả 409 `menu:1` để trang cập nhật giỏ.
- Không bật bộ nhớ đệm (cache) cho menu: chủ quán muốn đổi là khách thấy ngay.

## 8. Chủ quán tự quản lý ở `/#admin`

Thông tin quán, logo, mã QR, link fanpage, giao diện theo mùa (Noel, quà hộp bí mật), nhóm món, món, giá, ảnh món (tự cắt vuông giữa ảnh, 720×720, JPEG 80%; logo và QR giữ nguyên tỉ lệ), topping, nhãn món. Khách mở web tải hết ảnh một lượt.

**Còn có thể xung đột:** sửa menu trên 2 máy cùng lúc (hoặc bật "Hết món" ở `don.html` trong lúc sửa ở `/#admin`) thì lần lưu sau đè lần trước, vì cả hai gửi nguyên menu. Quán có nhiều người sửa menu thì nên làm: nút Hết món chỉ gửi đổi đúng một món, và `/#admin` báo khi menu đã bị máy khác đổi.
Sửa xong khách thấy ngay, không cần đưa code lên lại.
