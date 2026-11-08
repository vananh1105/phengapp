import { getStore } from "@netlify/blobs";
import { sendPushAll } from "./push.mjs";

// Báo quán có đơn mới: thông báo đẩy + Telegram (nếu đã cài)
// Tóm tắt đơn mới nhất cho thông báo đẩy (không có tên, số điện thoại khách)
export function orderSummary(code, text, v) {
  const t = String(text || "");
  const cups = [...t.matchAll(/^- (\d+) ×/gm)].reduce((a, m) => a + Number(m[1]), 0);
  const ship = /^Giao đến:/m.test(t), self = /^Khách tự đặt ship/m.test(t);
  return { code, total: (v && v.total) || 0, cups, ship, self, km: v && v.km != null ? v.km : null, at: Date.now() };
}

export async function notifyNewOrder(origin, code, text, v) {
  try { await getStore({ name: "push", consistency: "strong" }).setJSON("last", orderSummary(code, text, v)); } catch {}
  const jobs = [sendPushAll(origin).catch(() => 0)];
  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (token && chat) {
    jobs.push(fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text: "🧋 ĐƠN MỚI #" + code + " · ĐÃ THANH TOÁN\n\n" + text }),
      signal: AbortSignal.timeout(6000),
    }).catch(() => {}));
  }
  await Promise.all(jobs);
}
