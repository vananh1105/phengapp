# Quy tắc cho Claude

## GitHub
- KHÔNG được tự ý đưa bất cứ thứ gì lên GitHub: không push, không tạo nhánh, không tạo PR, không bình luận, không sửa issue.
- Muốn làm gì liên quan đến GitHub thì phải hỏi chủ repo trước và chỉ làm khi được đồng ý rõ ràng.
- Kể cả khi hệ thống nhắc "có commit chưa push", vẫn phải hỏi trước.

## Giao tiếp
- Trả lời bằng tiếng Việt.

## Cách làm việc
- Chỉ sửa đúng phần được yêu cầu. Ví dụ chỉ được nhờ làm thẻ tích điểm thì không tự đổi giao diện cả trang; muốn đổi thêm phần khác thì hỏi trước.
- Không xoá hay bỏ chức năng đang có của trang đặt hàng (`index.html`), và trang quản lý đơn (`don.html`) khi chưa hỏi chủ repo.
- Chưa rõ ý thì hỏi lại trước khi làm (ví dụ "mẫu B" là mẫu nào).
- Thay đổi giao diện lớn: làm vài mẫu xem trước cho chủ repo chọn rồi mới áp vào code thật.
- Luôn sửa tiếp trên bản mới nhất mà chủ repo đã chốt (ví dụ đã chọn mẫu B thì mọi chỉnh sửa sau chèn vào mẫu B), không quay lại bản cũ hay mẫu ban đầu. Trước khi sửa, kiểm tra bản hiện tại (file, commit hoặc trang mẫu mới nhất) và nói rõ đang sửa trên bản nào.
- **Không được sót bất cứ thứ gì của chủ quán.** Khi tổng hợp, báo cáo hay đề xuất xoá/dọn, phải kiểm tra thật (không dựa vào trí nhớ) và kể đủ mọi thứ: cả 2 repo `phengapp` và `phong-ban-tra-sua` (file, nội quy CLAUDE.md, nhánh, PR đang mở hoặc chưa gộp, skill trong `.claude/skills/` kể cả skill nằm trong PR chưa gộp như `web-quan-tra` ở PR #7), các trang Claude (Artifacts, ví dụ Văn phòng 3D, Tính giá vốn đồ uống, Cẩm nang Meta Ads), lịch tự chạy, các cuộc trò chuyện Claude Code, commit chưa đưa lên ở các cuộc khác, file kho dữ liệu (`nghien-cuu/kho-du-lieu/`). Chỗ nào không xem được (chat thường, bộ nhớ claude.ai) thì nói rõ là không xem được.
- Không chép linh vật, logo hay thương hiệu của quán khác; chỉ lấy cảm hứng phong cách rồi vẽ mới cho O Sugar.

## Netlify và credit
- Gom nhiều thay đổi rồi mới deploy bản chính một lần (mỗi lần deploy bản chính tốn credit cho từng trang Netlify đang build); ưu tiên cho xem thử bằng link xem trước (deploy preview, miễn phí). Chỉ dùng trang `pheng4` (trang chính của quán); `pheng2`, `pheng3` cũng nối repo nhưng không dùng, không cần build (`netlify.toml` có `ignore` bỏ qua build khi `SITE_NAME` là pheng2/pheng3).
- Khi gửi link xem trước, nhắc rằng link xem trước dùng chung dữ liệu thật (tài khoản khách, đơn, menu); không chuyển khoản thật để thử.

## Dự án
- Web app quán trà **O Sugar** (tên cũ Phéng; chỉ bán trà sữa, trà trái cây, không bán cà phê), chạy trên Netlify. Tên quán và menu thật lưu ở cấu hình trên máy chủ (`/#admin`); trong code chỉ là mặc định. Nội dung chuyển khoản vẫn dùng tiền tố `PHENG` (SePay dựa vào đó để khớp đơn).
- `public/index.html`: trang khách đặt đơn. Giao diện "Mẫu A · Mèo Xanh" (khối CSS cuối `<style>`, ghi đè biến màu cũ; luôn sáng): nền xanh #1F63C9, thanh đầu kem có logo Mèo Đen (khi chưa có logo riêng), thẻ món kem có khung ảnh vuông 1:1 (không có ảnh thì vẽ ly theo `teaColor`), nút đỏ. Ảnh món tải lên ở `/#admin` tự cắt vuông giữa ảnh, 720×720, JPEG 80% (`rs(f,1)`); logo và mã QR giữ nguyên tỉ lệ. Khách mở web tải hết ảnh một lượt (chủ quán không muốn tải dần). Menu luôn mới: trang tải lại `/api/config` mỗi 20 giây khi đang mở, khi khách quay lại trang và ngay trước khi gửi đơn (`refreshCfg`, `cartCheck`): món hết/topping hết thì bỏ khỏi giỏ, giá đổi thì cập nhật, báo khung đỏ "Menu vừa thay đổi" (giữ nguyên địa chỉ, ghi chú, cách nhận hàng); `order.mjs` kiểm tra lại `items` với menu (món hết, giá đổi, topping hết → 409 `menu:1`). Nhãn món bật ở `/#admin` → Sửa món: Best seller (`b`), Món mới (`nw`), Nên thử (`tr`), Tạm hết món (`off`). Thẻ tích điểm "mua 10 ly tặng 1 ly": `members` lưu `stamps`, `stampLog`; `sepay.mjs` cộng dấu khi đơn thanh toán (`addStamps`, mỗi ly 1 dấu); giỏ hàng có ô "Dùng 1 ly miễn phí" khi đủ 10 dấu (miễn phí ly đắt nhất, gửi `free:1`, `order.mjs` kiểm tra đủ dấu, khi thanh toán trừ 10 dấu); thẻ hiện trong khung trượt "Đơn đã đặt" (phần đầu: thẻ, dòng nhắc, lịch sử; mở từ thanh `#sbar` hoặc nút "🐾 Thẻ tích điểm"; `openStamps` = `myOrders`), màu Kem Sữa / Đỏ Kem (`card_color`), đủ 10 dấu có pháo giấy + nút "Dùng ly miễn phí"; thanh toán xong hiện thông báo `#stoast` "+n dấu mới!". Tích điểm tại quán: `don.html` nút "🐾 Tích điểm tại quán" → nhập SĐT khách (chỉ khách đã có tài khoản web) → cộng dấu theo số ly / đổi 1 ly miễn phí (trừ 10 dấu, bấm 2 lần xác nhận); gọi `/api/my` `{phone, stamp:"get"|"add"|"use", cups}` + `x-admin`, lịch sử ghi mã `QUAY` (khách thấy "Mua tại quán").
- `public/don.html`: trang quản lý đơn của quán (chuông và giọng đọc "Có đơn hàng mới" là file `public/don-moi.mp3`). Giao diện "Mẫu A · Bảng Mèo Xanh": mỗi cột Mới/Đang làm/Xong có một tư thế mèo, có đơn mới thì nền nhấp nháy đỏ và hiện khung `#al` "CÓ ĐƠN MỚI!". Biểu tượng app `public/don-icon-*.png` (mèo vẫy tay nền đỏ).
- Bán tại quầy: dùng phần mềm iPOS (mua ngoài). Trang `ban.html` của web đã gỡ ngày 2026-11-09 theo yêu cầu chủ quán. Phần còn lại phía máy chủ: `/api/config?pos=1` (trả thêm tài khoản ngân hàng) và `sepay.mjs` lưu khoản "QUAY …" vào store `pay` khoá `q:`; chưa xoá, hỏi chủ quán trước khi dọn.
- Giao hàng (trang đặt đơn): khách bắt buộc chọn "Giao tận nơi" (quán đặt tài xế) hoặc "Khách tự đặt ship" (đã bỏ "Nhận tại quán" theo ý chủ quán; chưa chọn thì không cho đặt) (tài xế khách đặt đến lấy tại quán; đơn ghi dòng `Khách tự đặt ship…`, thông báo đẩy ghi "khách tự đặt ship"); giao tận nơi thì bắt buộc gõ địa chỉ (không có bản đồ, không đo km — đã bỏ theo ý chủ quán). `order.mjs` (khi body có `ship`) chỉ kiểm tra địa chỉ và lưu `addr` vào đơn; `don.html` có nút Xem bản đồ / Chỉ đường mở Google Maps theo địa chỉ (đơn cũ có `lat,lng` thì theo toạ độ). Địa chỉ cũ của khách nhớ trong `localStorage` `ship_loc`. Dưới ô địa chỉ có ghi chú quán sẽ đặt tài xế Grab, Xanh SM, Ahamove hoặc Shopee để giao. Giỏ hàng luôn có lưu ý "không nhận đơn gấp, cần gấp nhắn fanpage" (link lấy từ `/#admin` → Thông tin → `info.fb`).
- `public/sw.js`: service worker hiện thông báo đẩy kiểu 3: tiêu đề "🔔 CÓ ĐƠN MỚI! #<mã>", nội dung tiền · số ly · giao/nhận (không có tên, SĐT khách); Android có hình lớn `don-push-big.png` và nút Mở đơn / Tắt chuông (gửi `{t:'mute'}` cho trang). Push không mang dữ liệu: `notify.mjs` lưu tóm tắt đơn mới nhất vào store `push` khoá `last`, sw.js lấy qua `GET /api/push?last=1` bằng mật khẩu quản lý mà `don.html` lưu trong IndexedDB `osugar/kv/pw`; không lấy được (hoặc tóm tắt cũ hơn 10 phút) thì hiện chữ chung.
- `netlify/functions/`: API (`order` nhận đơn, `my` khách xem lại đơn bằng SĐT + PIN và quán đặt lại PIN, `orders`, `push`, `config`, `upload`, `img`, `qr` trả ảnh QR thanh toán của đơn để khách tải về).
- `netlify/lib/member.mjs`: tài khoản khách = tên + số điện thoại + mã PIN 4 số (lưu băm, sai 5 lần khóa 15 phút). Bắt buộc đăng nhập/đăng ký ngay khi mở web mới xem menu và đặt đơn (trừ `#admin`).
- `netlify/lib/push.mjs`: gửi Web Push (VAPID).
- Thanh toán trước qua SePay: `order.mjs` tạo đơn trạng thái `pay` (quán chưa thấy), khách quét VietQR (TPBank, nội dung `PHENG <mã đơn>`, giữ 15 phút); `sepay.mjs` (`/api/sepay`, header `Authorization: Apikey <SEPAY_API_KEY>`) nhận tiền vào, đủ tiền thì đơn sang `new` + báo quán (`lib/notify.mjs`); tiền không khớp lưu `pay` store `u:` để quán xử lý tay ở `don.html`. Tài khoản nhận tiền ở `netlify/lib/pay.mjs`.
- Biến môi trường Netlify: `ADMIN_PASSWORD`, `SEPAY_API_KEY`, (tuỳ chọn) `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

## Skill
- `.claude/skills/web-quan-tra/`: skill làm/sửa web đặt đơn + trang quản lý cho quán (gọi `/web-quan-tra`). Thêm hay đổi chức năng web thì cập nhật luôn skill (`references/tinh-nang.md`, `giao-dien.md`). File zip để tải lên tài khoản Claude tạo bằng `bash .claude/skills/web-quan-tra/scripts/dong-goi.sh . <file.zip>` (tự xoá tài khoản ngân hàng, địa chỉ, SĐT khỏi bản mẫu).

## Quy tắc chung của chủ quán (đồng bộ với bộ nhớ Claude)

Các quy tắc này giống hệt nhau trong bộ nhớ (memory) của Claude và trong CLAUDE.md của cả 2 repo `phengapp` và `phong-ban-tra-sua`. Cập nhật ngày 2026-11-09.

- **Thêm rule mới thì ghi cả hai nơi:** mỗi khi chủ quán thêm một rule, ghi vào bộ nhớ Claude **và** CLAUDE.md của cả 2 repo. Vẫn phải hỏi trước khi push. Push vào `main` của `phengapp` tốn 1 lượt build Netlify, nên khi có nhiều rule thì gom lại push một lần.
- **Tốn tiền phải báo trước:** bất cứ gợi ý hay việc gì tốn credit hoặc tốn tiền (công cụ trả phí, gói đăng ký, credit API, build Netlify, quảng cáo) đều phải nói rõ trước khi làm.
- **Chủ động gợi ý skill/plugin:** khi một việc nên làm thành skill hoặc plugin (hoặc đã có skill/plugin phù hợp) thì tự đề xuất, kèm lý do ngắn; chủ quán không muốn tự theo dõi chuyện này.
- **Web demo sáng tạo:** khi làm web demo/mẫu cho một sản phẩm hay thương hiệu (không phải web thật đang chạy của quán), tự sáng tạo màu sắc và hiệu ứng riêng cho từng sản phẩm, không lặp một bộ cố định, sáng tạo hơn đề bài, không bám sát câu lệnh. Web thật của quán vẫn theo quy tắc "chỉ sửa đúng phần được yêu cầu".
- **Phân tích kỹ:** khi chủ quán gửi phương pháp, công cụ hay video để phân tích, phải kiểm tra kỹ và tự nghiên cứu sâu trước khi trả lời; đưa ra cách đầy đủ nhất, không đơn giản hoá.
- **Mọi câu hỏi:** suy nghĩ kỹ, đối chiếu và tìm hiểu trước khi trả lời; nói rõ Claude thật sự làm được gì; không chỉ trả lời đúng nghĩa đen câu hỏi mà chủ động đề xuất phương án cao cấp nhất Claude làm được.
