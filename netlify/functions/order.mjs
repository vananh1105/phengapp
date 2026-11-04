import { getStore } from "@netlify/blobs";
import { normPhone, validPin, checkPin, addOrder, MSG, STAMP_GOAL } from "../lib/member.mjs";
import { BANK, PAY_MIN, codeOf, payContent } from "../lib/pay.mjs";
export const config = { path: "/api/order" };
const orders = () => getStore({ name: "orders", consistency: "strong" });
const pays = () => getStore({ name: "pay", consistency: "strong" });

export default async (req) => {
  // Khách hỏi trạng thái thanh toán: GET /api/order?id=...
  if (req.method === "GET") {
    const id = new URL(req.url).searchParams.get("id") || "";
    if (!/^\d{4}-\d\d-\d\dT[\d:.]+Z-[0-9a-f]{6}$/.test(id)) return new Response("bad", { status: 400 });
    let v = null;
    try { v = await orders().get(id, { type: "json" }); } catch {}
    if (!v) return new Response("missing", { status: 404 });
    return Response.json(v.s === "pay" ? { s: v.s, bank: BANK } : { s: v.s, stampAdd: v.stampAdd, stamps: v.stamps }, { headers: { "cache-control": "no-store" } });
  }
  if (req.method !== "POST") return new Response("", { status: 405 });
  let d;
  try { d = await req.json(); } catch { return new Response("bad", { status: 400 }); }
  const text = String(d.text || "").slice(0, 3000), phone = String(d.phone || "").slice(0, 30), name = String(d.name || "").slice(0, 80);
  const total = Math.max(0, Math.min(Number(d.total) || 0, 1000000));
  const ph = normPhone(phone), pin = String(d.pin || "");
  if (text.length < 10 || ph.length < 8 || total <= 0) return new Response("bad", { status: 400 });
  if (!validPin(pin)) return Response.json({ err: "Mã PIN phải gồm 4 số", login: true }, { status: 401 });
  // Bắt buộc đã đăng ký: số điện thoại + PIN phải đúng thì mới tạo đơn
  const mem = await checkPin(ph, pin);
  if (mem.st !== "ok") return Response.json({ err: MSG[mem.st] || "Lỗi", login: true }, { status: mem.st === "locked" ? 429 : 401 });
  // Giao tận nơi: chỉ cần địa chỉ khách gõ. Nhận tại quán thì không cần.
  let shipInfo = {};
  if (d.ship) {
    const addr = String(d.addr || "").trim().slice(0, 300);
    if (addr.length < 5) return Response.json({ err: "Bạn chưa điền địa chỉ giao hàng" }, { status: 400 });
    shipInfo = { addr };
  }
  // Dùng 1 ly miễn phí từ thẻ tích điểm: phải đủ 10 dấu (dấu bị trừ khi đơn thanh toán xong, xem sepay.mjs)
  const free = d.free ? 1 : 0;
  if (free && (mem.m.stamps || 0) < STAMP_GOAL) return Response.json({ err: "Thẻ của bạn chưa đủ " + STAMP_GOAL + " dấu để đổi ly miễn phí" }, { status: 400 });
  const at = new Date().toISOString();
  const id = at + "-" + crypto.randomUUID().slice(0, 6), code = codeOf(id);
  const amount = Math.round(total * 1000); // total tính theo nghìn đồng
  // Đơn ở trạng thái "pay" (chờ thanh toán): chưa hiện ở trang quản lý, chưa báo quán.
  // Chỉ khi SePay báo tiền vào đủ (xem sepay.mjs) đơn mới chuyển sang "new".
  try {
    await orders().setJSON(id, { t: text, name, phone, total, amount, s: "pay", at, exp: Date.now() + PAY_MIN * 60000, ...shipInfo, ...(free ? { free: 1 } : {}) });
    await pays().setJSON("c:" + code, { id });
  } catch { return new Response("failed", { status: 502 }); }
  try { await addOrder(ph, id); } catch {}
  return Response.json({ ok: true, id, code, amount, content: payContent(code), bank: BANK, min: PAY_MIN });
};
