// Tài khoản nhận tiền (đã liên kết SePay)
export const BANK = { bank: "TPBank", acc: "00004415524", holder: "LE THI VAN ANH" };
export const PAY_MIN = 15; // phút giữ đơn chờ thanh toán
export const PREFIX = "PHENG";
export const codeOf = (id) => id.slice(-6).toUpperCase();
export const payContent = (code) => PREFIX + " " + code;
// Tìm mã đơn trong nội dung chuyển khoản, chịu được dấu cách/gạch bị ngân hàng đổi
export function findCode(text) {
  const m = String(text || "").toUpperCase().match(/PHENG[\s._-]*([0-9A-F]{6})(?![0-9A-F])/);
  return m ? m[1] : null;
}
