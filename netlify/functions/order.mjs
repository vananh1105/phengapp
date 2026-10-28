import { getStore } from "@netlify/blobs";
export const config = { path: "/api/order" };
export default async (req) => {
  if (req.method !== "POST") return new Response("", { status: 405 });
  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return new Response("not configured", { status: 500 });
  let d;
  try { d = await req.json(); } catch { return new Response("bad", { status: 400 }); }
  const text = String(d.text || "").slice(0, 3000), phone = String(d.phone || "").slice(0, 30);
  if (text.length < 10 || phone.length < 8) return new Response("bad", { status: 400 });
  const msg = "🧋 ĐƠN MỚI\n\n" + text;
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text: msg }),
  });
  try { await getStore("orders").set(new Date().toISOString() + "-" + crypto.randomUUID().slice(0, 6), text); } catch {}
  return r.ok ? Response.json({ ok: true }) : new Response("telegram failed", { status: 502 });
};
