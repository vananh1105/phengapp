import { getStore } from "@netlify/blobs";
import { sendPushAll } from "../lib/push.mjs";
export const config = { path: "/api/order" };
export default async (req, context) => {
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
      body: JSON.stringify({ chat_id: chat, text: "🧋 ĐƠN MỚI\n\n" + text }),
      signal: AbortSignal.timeout(6000),
    }).then((r) => { sent = r.ok; }).catch(() => {}));
  }
  await Promise.all(jobs);
  // Nhắc thêm 2 lần (sau 8s và 16s) nếu đơn vẫn chưa được nhận, không bắt khách chờ
  if (saved && context && typeof context.waitUntil === "function") {
    const origin = new URL(req.url).origin, store = getStore({ name: "orders", consistency: "strong" });
    context.waitUntil((async () => {
      for (const ms of [8000, 8000]) {
        await new Promise((r) => setTimeout(r, ms));
        try { const v = await store.get(id, { type: "json" }); if (!v || v.s !== "new") return; } catch { return; }
        await sendPushAll(origin).catch(() => 0);
      }
    })());
  }
  return saved || sent ? Response.json({ ok: true }) : new Response("failed", { status: 502 });
};
