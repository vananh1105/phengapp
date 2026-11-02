import { sendPushAll } from "./push.mjs";

// Báo quán có đơn mới: thông báo đẩy + Telegram (nếu đã cài)
export async function notifyNewOrder(origin, code, text) {
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
