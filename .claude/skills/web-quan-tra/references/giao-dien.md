# Giao diện, linh vật, biểu tượng app

## Nguyên tắc

- Mỗi quán một bộ nhận diện riêng: màu, kiểu chữ, linh vật hoặc logo. Không bắt quán nào dùng giao diện O Sugar.
- Luôn làm **3–4 mẫu xem trước** trên một trang Artifact (cỡ điện thoại), ghi tên mẫu rõ ("Mẫu A · …") để chủ quán chọn bằng tên.
- Chọn xong thì ghi tên mẫu vào `CLAUDE.md` của repo; các lần sửa sau làm tiếp trên mẫu đó.
- Màu dịu, hợp quán; tránh lè loẹt. Chữ tiêu đề có cá tính (Google Fonts), chữ nội dung dễ đọc (Be Vietnam Pro, Nunito… có đủ dấu tiếng Việt).

## Áp vào code

- `index.html`: thêm một khối CSS "Giao diện Mẫu …" ở **cuối** `<style>`, ghi đè biến màu (`--bg`, `--sky`, `--cd`, `--ink`, `--mut`, `--ln`, `--mr`, `--pk`) và các phần cần đổi. Không sửa rải rác cả file.
- `don.html`: cùng bộ màu và linh vật với trang đặt đơn.
- Kiểm tra trùng tên class/id với phần có sẵn trước khi thêm (ví dụ `.gift`, `.cp`, `#mst` đã từng bị trùng).

## Ảnh món

- Khung ảnh thẻ món **vuông 1:1** (ly đứng, khung ngang dễ cắt mất nắp/ống hút/đáy). Ảnh tải lên tự cắt vuông giữa ảnh, 720×720, ~50–70KB.
- Dặn chủ quán chụp: ly đứng giữa ảnh, chừa khoảng trống, nền trơn sáng, cùng chỗ cùng ánh sáng, ban ngày, không flash.

## Linh vật

- Vẽ SVG `<symbol>` ngay trong file (vài tư thế: ôm ly, vẫy tay, ló đầu, ngủ…), tô màu bằng biến CSS (`--cat`, `--face`, `--cup`, `--lid`, `--blush`) để đổi màu dễ.
- Mèo Đen là linh vật riêng của O Sugar — quán khác vẽ linh vật khác.
- Không có ảnh món thì vẽ ly nước, màu nước đoán theo tên món (`teaColor`).

## Biểu tượng app (khi khách thêm vào màn hình chính)

- Làm 3–4 mẫu biểu tượng, xem trên màn hình chính giả lập nền sáng + tối, cỡ thật.
- Xuất PNG bằng Playwright từ SVG: 180 (iPhone, `apple-touch-icon`), 192, 512, 512 maskable (hình thu vào 80% giữa).
- Trang đặt đơn: `manifest-dat.webmanifest` (`short_name` ≤ 12 ký tự là tên dưới biểu tượng), `<link rel="apple-touch-icon">`, `apple-mobile-web-app-title`. Giữ `display: "browser"` để khách không phải đăng nhập lại và tải ảnh QR bình thường.
- Trang quản lý và phần mềm tại quầy dùng biểu tượng **khác màu** để quán không nhầm.
- Giải thích cho chủ quán: đổi giao diện, menu thì khách tự thấy; chỉ biểu tượng trên iPhone là giữ hình lúc thêm, đổi biểu tượng thì khách phải xoá và thêm lại — nên chốt biểu tượng sớm.
