import { getStore } from "@netlify/blobs";
import { sendPushAll } from "../lib/push.mjs";
export const config = { schedule: "* * * * *" };

// Có đơn "new" nào đã chờ từ 10 giây đến 45 phút không
async function hasPending(store) {
  const day = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
  const keys = [];
  for (const p of [day(0), day(1)]) {
    const { blobs } = await store.list({ prefix: p });
    blobs.forEach((b) => keys.push(b.key));
  }
  const now = Date.now();
  for (const id of keys) {
    const age = now - new Date(id.slice(0, 24)).getTime();
    if (!(age >= 10000 && age <= 45 * 60000)) continue;
    try {
      const v = await store.get(id, { type: "json" });
      if (v && typeof v === "object" && v.s === "new") return true;
    } catch {}
  }
  return false;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Chạy mỗi phút; trong một lần chạy nhắc 3 lần, cách nhau 10 giây,
// tới khi đơn được bấm "Đã nhận đơn".
export default async () => {
  const store = getStore({ name: "orders", consistency: "strong" });
  for (let i = 0; i < 3; i++) {
    if (i) await sleep(10000);
    if (!(await hasPending(store))) return;
    await sendPushAll();
  }
};
