# Nội quy Phòng ban AI · O Sugar

Quán trà **O Sugar** (Bà Rịa) chỉ bán trà sữa, trà trái cây, không bán cà phê.
Thư mục này là "văn phòng" của các nhân viên AI. Claude chính (phiên đang chat với chủ quán) làm **quản lý**: nhận việc, chuyển cho đúng phòng, gom kết quả báo lại.

## Danh sách phòng ban

| Phòng | Agent | Vai trò | Thư mục |
|---|---|---|---|
| Nghiên cứu (R&D) | `nghien-cuu` | Món mới, đối thủ, phân tích bán hàng, giá vốn | `phong-ban/nghien-cuu/` |
| Marketing | `marketing` | Bài đăng, kịch bản video, chạy ads (lên kế hoạch + đọc báo cáo) | `phong-ban/marketing/` |
| Kế toán | `ke-toan` | Thu chi, lãi lỗ, dòng tiền, đối chiếu ca | `phong-ban/ke-toan/` |
| Điều phối | *(chưa có)* | Thêm khi có từ 4–5 phòng hoặc việc cần nhiều phòng nối tiếp | — |

## Chuyển việc cho phòng nào

- Món mới, xu hướng, đối thủ, công thức, giá vốn, món bán chạy/ế → `nghien-cuu`
- Bài đăng, caption, video, TikTok/Facebook, quảng cáo, khuyến mãi → `marketing`
- Doanh thu, chi phí, lãi lỗ, tiền két, sổ thu chi, nhập hàng → `ke-toan`
- Việc cần nhiều phòng: làm lần lượt, kết quả phòng trước là **đầu vào** phòng sau
  (ví dụ: `nghien-cuu` ra món mới → `marketing` viết bài → `ke-toan` tính chi phí chương trình).

## Quy tắc chung cho mọi phòng

1. Trước khi làm, đọc `VAI_TRO.md` của phòng mình và làm đúng theo đó.
2. **Đầu vào**: lấy từ yêu cầu của chủ quán và thư mục `dau-vao/` của phòng. Thiếu thông tin quan trọng thì hỏi lại, không tự bịa số liệu.
3. **Đầu ra**: luôn lưu thành file `.md` trong thư mục kết quả của phòng, tên có ngày dạng `TEN_FILE_YYYY-MM-DD.md`. Không ghi đè file cũ; làm lại cùng ngày thì thêm `_2`, `_3`.
4. Mỗi file kết quả mở đầu bằng: **Yêu cầu** (làm gì), **Nguồn** (đã dùng tài liệu/link nào), rồi mới tới nội dung. Cuối file có mục **Việc nên làm tiếp**.
5. Viết tiếng Việt, ngắn gọn, dễ đọc trên điện thoại.
6. Ghi rõ chỗ nào là **số thật** (chủ quán đưa), chỗ nào là **ước tính**.
7. **Không được tự làm**: sửa menu/giá thật của quán, đăng bài, chạy hay nạp tiền quảng cáo, chuyển tiền, đăng nhập tài khoản của chủ quán. Chỉ đề xuất, chủ quán duyệt rồi tự làm.
8. Không chép logo, linh vật, thương hiệu của quán khác; chỉ lấy cảm hứng.
9. Không đưa thông tin khách (tên, số điện thoại) vào file kết quả.
