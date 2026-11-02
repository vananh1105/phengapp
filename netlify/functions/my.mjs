import { getStore } from "@netlify/blobs";
import { normPhone, validPin, checkPin, resetPin } from "../lib/member.mjs";
export const config = { path: "/api/my" };
const pw = () => (process.env.ADMIN_PASSWORD || "").trim();
const isAdmin = (req) => !!pw() && (req.headers.get("x-admin") || "").trim() === pw();
const codeOf = (id) => id.slice(-6).toUpperCase();
const MSG = { none: "Số này chưa có mã PIN (hoặc quán vừa đặt lại). Đặt đơn mới kèm PIN là xem được", wrong: "Sai mã PIN", locked: "Nhập sai nhiều lần, thử lại sau 15 phút hoặc gọi quán" };

// POST { phone, pin } -> danh sách đơn của số đó
// POST { phone, reset: true } + x-admin -> quán đặt lại PIN cho khách
export default async (req) => {
  if (req.method !== "POST") return new Response("", { status: 405 });
  let d;
  try { d = await req.json(); } catch { return new Response("bad", { status: 400 }); }
  const ph = normPhone(d && d.phone);
  if (ph.length < 8) return Response.json({ err: "Số điện thoại không hợp lệ" }, { status: 400 });
  if (d.reset) {
    if (!isAdmin(req)) return new Response("no", { status: 401 });
    return Response.json({ ok: await resetPin(ph) });
  }
  if (!validPin(d.pin)) return Response.json({ err: "Mã PIN phải gồm 4 số" }, { status: 400 });
  const r = await checkPin(ph, d.pin);
  if (r.st !== "ok") return Response.json({ err: MSG[r.st] || "Lỗi" }, { status: r.st === "locked" ? 429 : 403 });
  const os = getStore({ name: "orders", consistency: "strong" });
  const out = await Promise.all((r.m.orders || []).slice(0, 30).map(async (id) => {
    try {
      const v = await os.get(id, { type: "json" });
      return v && typeof v === "object" ? { id, code: codeOf(id), s: v.s, at: v.at, total: v.total, t: v.t } : null;
    } catch { return null; }
  }));
  return Response.json({ orders: out.filter(Boolean) }, { headers: { "cache-control": "no-store" } });
};
