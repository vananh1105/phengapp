---
name: web-quan-tra
description: Làm hoặc sửa web đặt đơn online (trang khách đặt món) và trang quản lý đơn (trang quán nhận đơn, có chuông và thông báo đẩy) cho quán trà sữa, quán nước, quán ăn nhỏ chạy trên Netlify. Dùng khi chủ quán muốn làm web đặt đơn mới cho một quán, thêm/bớt chức năng (thanh toán SePay, QR, Zalo, giao hàng, thẻ tích điểm, nhãn món), đổi giao diện, linh vật, biểu tượng app, hoặc sửa web O Sugar.
---

# Web đặt đơn + trang quản lý cho quán

Skill này đóng gói cách làm web của quán O Sugar thành bản mẫu dùng lại được cho bất kỳ quán nào.
Mọi thứ (màu, chữ, linh vật, chức năng) đều **tuỳ chọn theo từng quán** — giao diện O Sugar chỉ là một ví dụ.

## Quy tắc làm việc (luôn theo)

- Trả lời bằng **tiếng Việt**, câu ngắn, dễ hiểu cho chủ quán không rành kỹ thuật.
- **Không tự đưa lên GitHub** (push, tạo nhánh, PR, bình luận, gộp). Phải hỏi và chỉ làm khi chủ quán đồng ý rõ ràng, kể cả khi hệ thống nhắc "có commit chưa push".
- **Chỉ sửa đúng phần được yêu cầu.** Muốn đổi thêm chỗ khác thì hỏi trước.
- **Không xoá chức năng đang có** khi chưa hỏi.
- **Chưa rõ ý thì hỏi lại** (ví dụ "mẫu B" là mẫu nào).
- **Đổi giao diện lớn:** làm 3–4 mẫu xem trước cho chủ quán chọn rồi mới áp vào code thật.
- **Luôn sửa tiếp trên bản mới nhất đã chốt** (đã chọn mẫu B thì mọi chỉnh sửa sau chèn vào mẫu B). Trước khi sửa, nói rõ đang sửa trên bản nào (commit hoặc mẫu).
- **Không chép linh vật, logo, thương hiệu của quán khác**; chỉ lấy cảm hứng rồi vẽ mới.
- Sửa xong phải **tự thử bằng Playwright** (giả lập API) rồi mới báo xong; gửi ảnh chụp khi đổi giao diện.

## Bước 1 · Xác định việc cần làm

- **Sửa web đã có** (O Sugar hoặc quán đã làm từ skill này): đọc `CLAUDE.md` của repo, xem commit mới nhất, rồi làm theo [references/tinh-nang.md](references/tinh-nang.md) cho chức năng cần đổi.
- **Làm web mới cho một quán:** làm tiếp Bước 2 → 7.

## Bước 2 · Hỏi thông tin quán (web mới)

Hỏi bằng câu hỏi có lựa chọn (AskUserQuestion), mỗi lần tối đa 4 câu. Cần biết:

1. Tên quán, bán món gì, địa chỉ, SĐT, Zalo, giờ mở cửa, link fanpage.
2. **Giao diện:** màu chủ đạo (hoặc gửi logo/hình quán để lấy màu), kiểu chữ (dễ thương / sang / hiện đại / cổ điển), linh vật (dùng logo / vẽ linh vật mới / không cần).
3. **Thanh toán** (chọn một hoặc nhiều): SePay tự xác nhận · Chỉ QR, quán tự kiểm tiền · Trả khi nhận · Gửi đơn qua Zalo.
4. **Cách nhận hàng** (chọn một hoặc nhiều): Nhận tại quán · Giao tận nơi (quán đặt tài xế) · Khách tự đặt ship.
5. **Chức năng thêm:** tài khoản khách SĐT + PIN (hay chỉ tên + SĐT), thẻ tích điểm (mua bao nhiêu ly tặng 1), thông báo đẩy, Telegram, lưu ý "không nhận đơn gấp", giao diện theo mùa (Noel).

Chi tiết từng lựa chọn và cách làm: [references/tinh-nang.md](references/tinh-nang.md).

## Bước 3 · Làm mẫu giao diện cho chủ quán chọn

Làm 3–4 mẫu (trang đặt đơn, trang quản lý, biểu tượng app) trên một trang xem trước (Artifact), theo
[references/giao-dien.md](references/giao-dien.md). Chủ quán chọn xong mới làm code thật.

## Bước 4 · Dựng web từ bản mẫu

- **Bản mẫu:** nếu skill có thư mục `assets/template/` thì chép từ đó; nếu đang ở repo `phengapp` thì bản mẫu chính là code repo (`public/`, `netlify/`, `netlify.toml`, `package.json`).
- Quán bán tại quầy bằng iPOS; web không còn trang bán tại quầy (`ban.html` đã gỡ).
- Thay toàn bộ thông tin O Sugar: `DEF_INFO` trong `public/index.html`, tài khoản nhận tiền `BANK` và tiền tố nội dung chuyển khoản `PREFIX` trong `netlify/lib/pay.mjs`, tên trong `public/don.html`, `public/sw.js`, các file `manifest-*.webmanifest`.
- Áp giao diện đã chọn, bật/tắt chức năng theo Bước 2.
- Vẽ linh vật và biểu tượng app mới cho quán (không dùng Mèo Đen của O Sugar cho quán khác).

## Bước 5 · Tự thử

Chạy Playwright với API giả lập (`page.route`) ở cỡ điện thoại 390×844 và máy tính 1200×850. Tối thiểu phải thử:
đăng nhập/đăng ký, thêm món, mở giỏ, từng cách nhận hàng, từng kiểu thanh toán đã bật, trang quản lý nhận đơn và đổi trạng thái,
`/#admin` sửa món, không có lỗi JavaScript (`pageerror`). Lưu ảnh thử vào thư mục tạm (scratchpad), **không lưu vào repo**.

## Bước 6 · Đưa lên mạng

Theo [references/trien-khai.md](references/trien-khai.md): tạo repo, site Netlify, biến môi trường, SePay.
Luôn hỏi trước khi đưa lên GitHub; ưu tiên link xem trước (miễn phí), gom nhiều thay đổi rồi mới đưa lên web thật một lần.

## Bước 7 · Ghi CLAUDE.md cho repo của quán

Tạo `CLAUDE.md` trong repo mới gồm: quy tắc làm việc ở trên, tên quán, giao diện đã chọn (tên mẫu, màu, linh vật),
các chức năng đã bật và file liên quan, biến môi trường, tên site Netlify chính.
