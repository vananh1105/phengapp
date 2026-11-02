import { getStore } from "@netlify/blobs";
import { sendPushAll } from "../lib/push.mjs";
import { normPhone, validPin, checkPin, addOrder, MSG } from "../lib/member.mjs";
export const config = { path: "/api/order" };
const codeOf = (id) => id.slice(-6).toUpperCase();
export default async (req) => {
  if (req.method !== "POST") return new Response("", { status: 405 });
  let d;
  try { d = await req.json(); } catch { return new Response("bad", { status: 400 }); }
  const text = String(d.text || "").slice(0, 3000), phone = String(d.phone || "").slice(0, 30), name = String(d.name || "").slice(0, 80);
  const total = Math.max(0, Math.min(Number(d.total) || 0, 1000000));
  const ph = normPhone(phone), pin = String(d.pin || "");
  if (text.length < 10 || ph.length < 8) return new Response("bad", { status: 400 });
  if (!validPin(pin)) return Response.json({ err: "Mã PIN phải gồm 4 số", login: true }, { status: 401 });
  // Bắt buộc đã đăng ký: số điện thoại + PIN phải đúng thì mới nhận đơn
  const mem = await checkPin(ph, pin);
  if (mem.st !== "ok") return Response.json({ err: MSG[mem.st] || "Lỗi", login: true }, { status: mem.st === "locked" ? 429 : 401 });
  const at = new Date().toISOString();
  const id = at + "-" + crypto.randomUUID().slice(0, 6);
  let saved = false, sent = false;
  try { await getStore({ name: "orders", consistency: "strong" }).setJSON(id, { t: text, name, phone, total, s: "new", at }); saved = true; } catch {}
  if (saved) { try { await addOrder(ph, id); } catch {} }
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
