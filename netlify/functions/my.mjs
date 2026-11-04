import { getStore } from "@netlify/blobs";
import { normPhone, validPin, checkPin, register, resetPin, MSG, getMember, addStamps, STAMP_GOAL } from "../lib/member.mjs";
export const config = { path: "/api/my" };
const pw = () => (process.env.ADMIN_PASSWORD || "").trim();
const isAdmin = (req) => !!pw() && (req.headers.get("x-admin") || "").trim() === pw();
const codeOf = (id) => id.slice(-6).toUpperCase();

// POST { action: "register", name, phone, pin } -> tạo tài khoản
// POST { phone, pin }                           -> đăng nhập, trả về tên + danh sách đơn
// POST { phone, reset: true } + x-admin         -> quán đặt lại PIN cho khách
// POST { phone, stamp: "get"|"add"|"use", cups } + x-admin -> quán xem thẻ / cộng dấu / đổi ly miễn phí cho khách mua tại quán
export default async (req) => {
  if (req.method !== "POST") return new Response("", { status: 405 });
  let d;
  try { d = await req.json(); } catch { return new Response("bad", { status: 400 }); }
  const ph = normPhone(d && d.phone);
  if (ph.length < 9 || ph.length > 12) return Response.json({ err: "Số điện thoại không hợp lệ" }, { status: 400 });
  if (d.reset) {
    if (!isAdmin(req)) return new Response("no", { status: 401 });
    return Response.json({ ok: await resetPin(ph) });
  }
  if (d.stamp) {
    if (!isAdmin(req)) return new Response("no", { status: 401 });
    const m = await getMember(ph);
    if (!m) return Response.json({ err: "Số này chưa có tài khoản trên web. Nhờ khách đăng ký trên web đặt đơn trước nhé." }, { status: 404 });
    const card = (x) => ({ ok: true, name: x.name || "", stamps: x.stamps || 0, goal: STAMP_GOAL, log: (x.stampLog || []).slice(0, 5) });
    if (d.stamp === "get") return Response.json(card(m));
    if (d.stamp === "add") {
      const cups = Math.floor(Number(d.cups));
      if (!(cups >= 1 && cups <= 30)) return Response.json({ err: "Số ly phải từ 1 đến 30" }, { status: 400 });
      await addStamps(ph, "QUAY", cups, 0);
    } else if (d.stamp === "use") {
      if ((m.stamps || 0) < STAMP_GOAL) return Response.json({ err: "Thẻ chưa đủ " + STAMP_GOAL + " dấu" }, { status: 400 });
      await addStamps(ph, "QUAY", 1, 1);
    } else return new Response("bad", { status: 400 });
    return Response.json(card(await getMember(ph)));
  }
  if (!validPin(d.pin)) return Response.json({ err: "Mã PIN phải gồm 4 số" }, { status: 400 });
  if (d.action === "register") {
    const name = String(d.name || "").trim().slice(0, 80);
    if (!name) return Response.json({ err: "Hãy nhập tên" }, { status: 400 });
    if ((await register(ph, d.pin, name)) === "exists") return Response.json({ err: MSG.exists }, { status: 409 });
    return Response.json({ ok: true, name, orders: [], stamps: 0, stampLog: [] });
  }
  const r = await checkPin(ph, d.pin);
  if (r.st !== "ok") return Response.json({ err: MSG[r.st] || "Lỗi" }, { status: r.st === "locked" ? 429 : 403 });
  const os = getStore({ name: "orders", consistency: "strong" });
  const out = await Promise.all((r.m.orders || []).slice(0, 30).map(async (id) => {
    try {
      const v = await os.get(id, { type: "json" });
      return v && typeof v === "object" ? { id, code: codeOf(id), s: v.s, at: v.at, total: v.total, t: v.t } : null;
    } catch { return null; }
  }));
  return Response.json({ ok: true, name: r.m.name || "", orders: out.filter(Boolean), stamps: r.m.stamps || 0, stampLog: r.m.stampLog || [] }, { headers: { "cache-control": "no-store" } });
};
