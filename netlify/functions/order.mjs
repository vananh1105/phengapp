import { getStore } from "@netlify/blobs";
import { normPhone, validPin, checkPin, addOrder, MSG } from "../lib/member.mjs";
import { BANK, PAY_MIN, codeOf, payContent } from "../lib/pay.mjs";
import { shopOf, roadKm, validLatLng } from "../lib/geo.mjs";
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
    return Response.json(v.s === "pay" ? { s: v.s, bank: BANK } : { s: v.s }, { headers: { "cache-control": "no-store" } });
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
  // Giao tận nơi: phải có địa chỉ + vị trí trên bản đồ, quãng đường đi theo bản đồ không quá giới hạn (mặc định 10 km).
  // Nhận tại quán thì không cần.
  let shipInfo = {};
  if (d.ship) {
    const addr = String(d.addr || "").trim().slice(0, 300), lat = Number(d.lat), lng = Number(d.lng);
    if (addr.length < 5) return Response.json({ err: "Bạn chưa điền địa chỉ giao hàng" }, { status: 400 });
    if (!validLatLng(lat, lng)) return Response.json({ err: "Bạn chưa chọn vị trí giao hàng trên bản đồ" }, { status: 400 });
    let info = {};
    try { info = ((await getStore({ name: "shop", consistency: "strong" }).get("config", { type: "json" })) || {}).info || {}; } catch {}
    const shop = shopOf(info), dist = await roadKm(shop, { lat, lng }), km = Math.round(dist.km * 10) / 10;
    if (km > shop.maxKm) return Response.json({ err: `Địa chỉ cách quán khoảng ${km} km, ngoài vùng giao hàng (tối đa ${shop.maxKm} km)`, far: true, km }, { status: 400 });
    shipInfo = { addr, lat, lng, km, road: dist.road };
  }
  const at = new Date().toISOString();
  const id = at + "-" + crypto.randomUUID().slice(0, 6), code = codeOf(id);
  const amount = Math.round(total * 1000); // total tính theo nghìn đồng
  // Đơn ở trạng thái "pay" (chờ thanh toán): chưa hiện ở trang quản lý, chưa báo quán.
  // Chỉ khi SePay báo tiền vào đủ (xem sepay.mjs) đơn mới chuyển sang "new".
  try {
    await orders().setJSON(id, { t: text, name, phone, total, amount, s: "pay", at, exp: Date.now() + PAY_MIN * 60000, ...shipInfo });
    await pays().setJSON("c:" + code, { id });
  } catch { return new Response("failed", { status: 502 }); }
  try { await addOrder(ph, id); } catch {}
  return Response.json({ ok: true, km: shipInfo.km, id, code, amount, content: payContent(code), bank: BANK, min: PAY_MIN });
};
