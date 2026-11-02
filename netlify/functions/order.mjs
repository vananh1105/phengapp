import { getStore } from "@netlify/blobs";
import { sendPushAll } from "../lib/push.mjs";
export const config = { path: "/api/order" };
const codeOf = (id) => id.slice(-6).toUpperCase();
const digits = (s) => String(s || "").replace(/\D/g, "");
export default async (req) => {
  // Khách xem lại đơn của mình: cần đúng mã đơn (id) và số điện thoại đã đặt
  if (req.method === "GET") {
    const u = new URL(req.url), id = u.searchParams.get("id") || "", ph = digits(u.searchParams.get("phone"));
    if (!/^\d{4}-\d\d-\d\dT[\d:.]+Z-[0-9a-f]{6}$/.test(id) || ph.length < 8) return new Response("bad", { status: 400 });
    let v = null;
    try { v = await getStore({ name: "orders", consistency: "strong" }).get(id, { type: "json" }); } catch {}
    if (!v || typeof v !== "object" || digits(v.phone) !== ph) return new Response("missing", { status: 404 });
    return Response.json({ code: codeOf(id), s: v.s, at: v.at, total: v.total, t: v.t }, { headers: { "cache-control": "no-store" } });
  }
  if (req.method !== "POST") return new Response("", { status: 405 });
  let d;
  try { d = await req.json(); } catch { return new Response("bad", { status: 400 }); }
  const text = String(d.text || "").slice(0, 3000), phone = String(d.phone || "").slice(0, 30), name = String(d.name || "").slice(0, 80);
  const total = Math.max(0, Math.min(Number(d.total) || 0, 1000000));
  if (text.length < 10 || phone.length < 8) return new Response("bad", { status: 400 });
  const at = new Date().toISOString();
  const id = at + "-" + crypto.randomUUID().slice(0, 6);
  let saved = false, sent = false;
  try { await getStore({ name: "orders", consistency: "strong" }).setJSON(id, { t: text, name, phone, total, s: "new", at }); saved = true; } catch {}
  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  const jobs = [];
  if (saved) jobs.push(sendPushAll(new URL(req.url).origin).catch(() => 0));
  if (token && chat) {
    jobs.push(fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text: "🧋 ĐƠN MỚI" + (saved ? " #" + codeOf(id) : "") + "\n\n" + text }),
      signal: AbortSignal.timeout(6000),
    }).then((r) => { sent = r.ok; }).catch(() => {}));
  }
  await Promise.all(jobs);
  return saved || sent ? Response.json(saved ? { ok: true, id, code: codeOf(id) } : { ok: true }) : new Response("failed", { status: 502 });
};
