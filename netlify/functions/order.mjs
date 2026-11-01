import { getStore } from "@netlify/blobs";
export const config = { path: "/api/order" };
export default async (req) => {
  if (req.method !== "POST") return new Response("", { status: 405 });
  let d;
  try { d = await req.json(); } catch { return new Response("bad", { status: 400 }); }
  const text = String(d.text || "").slice(0, 3000), phone = String(d.phone || "").slice(0, 30), name = String(d.name || "").slice(0, 80);
  const total = Math.max(0, Math.min(Number(d.total) || 0, 1000000));
  if (text.length < 10 || phone.length < 8) return new Response("bad", { status: 400 });
  const at = new Date().toISOString();
  const id = at + "-" + crypto.randomUUID().slice(0, 6);
  let saved = false, sent = false;
  try { await getStore("orders").setJSON(id, { t: text, name, phone, total, s: "new", at }); saved = true; } catch {}
  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (token && chat) {
    try {
      const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: chat, text: "🧋 ĐƠN MỚI\n\n" + text }),
      });
      sent = r.ok;
    } catch {}
  }
  return saved || sent ? Response.json({ ok: true }) : new Response("failed", { status: 502 });
};
