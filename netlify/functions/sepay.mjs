import { getStore } from "@netlify/blobs";
import { findCode, codeOf } from "../lib/pay.mjs";
import { notifyNewOrder } from "../lib/notify.mjs";
export const config = { path: "/api/sepay" };

// SePay gọi vào đây mỗi khi tài khoản có tiền vào.
// Header: Authorization: Apikey <SEPAY_API_KEY>
export default async (req) => {
  if (req.method !== "POST") return new Response("", { status: 405 });
  const key = (process.env.SEPAY_API_KEY || "").trim();
  const auth = (req.headers.get("authorization") || "").replace(/^apikey\s+/i, "").trim();
  if (!key || auth !== key) return Response.json({ success: false, err: "unauthorized" }, { status: 401 });
  let d;
  try { d = await req.json(); } catch { return Response.json({ success: false }, { status: 400 }); }
  if (!d || d.transferType !== "in") return Response.json({ success: true });

  const pays = getStore({ name: "pay", consistency: "strong" });
  const orders = getStore({ name: "orders", consistency: "strong" });
  const txKey = "t:" + String(d.id || d.referenceCode || "");
  if (txKey !== "t:" && (await pays.get(txKey))) return Response.json({ success: true }); // đã xử lý (SePay gửi lại)

  const amount = Math.round(Number(d.transferAmount) || 0);
  const content = String(d.content || d.description || "");
  const code = findCode(content) || findCode(d.code);
  const tx = { amount, content: content.slice(0, 300), at: d.transactionDate || new Date().toISOString(), ref: d.referenceCode || "", txid: d.id || "" };

  let reason = "Không có mã đơn trong nội dung chuyển khoản";
  if (code) {
    const link = await pays.get("c:" + code, { type: "json" });
    const v = link && (await orders.get(link.id, { type: "json" }));
    if (!v) reason = "Không tìm thấy đơn " + code;
    else if (v.s !== "pay") reason = "Đơn " + code + " đã thanh toán trước đó (chuyển trùng?)";
    else if (amount < (v.amount || 0)) reason = "Chuyển thiếu tiền cho đơn " + code + ": cần " + v.amount + "đ";
    else {
      v.s = "new"; v.paid = amount; v.paidAt = new Date().toISOString(); v.tx = tx.ref || tx.txid;
      if (v.exp && Date.now() > v.exp) v.late = 1;
      await orders.setJSON(link.id, v);
      await pays.setJSON(txKey, { ok: 1, id: link.id });
      await notifyNewOrder(new URL(req.url).origin, codeOf(link.id), v.t);
      return Response.json({ success: true });
    }
  }
  // Tiền vào nhưng không khớp đơn: lưu lại cho quán xử lý tay
  await pays.setJSON("u:" + new Date().toISOString() + "-" + (tx.txid || Math.random().toString(36).slice(2, 8)), { ...tx, reason, code: code || "" });
  if (txKey !== "t:") await pays.setJSON(txKey, { ok: 0 });
  return Response.json({ success: true });
};
