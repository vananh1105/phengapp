import { getStore } from "@netlify/blobs";
import { sendPushAll } from "../lib/push.mjs";
export const config = { schedule: "* * * * *" };
export default async () => {
  const store = getStore({ name: "orders", consistency: "strong" });
  const day = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
  const keys = [];
  for (const p of [day(0), day(1)]) {
    const { blobs } = await store.list({ prefix: p });
    blobs.forEach((b) => keys.push(b.key));
  }
  const now = Date.now();
  let pending = false;
  for (const id of keys) {
    const age = now - new Date(id.slice(0, 24)).getTime();
    if (!(age >= 45000 && age <= 45 * 60000)) continue;
    try {
      const v = await store.get(id, { type: "json" });
      if (v && typeof v === "object" && v.s === "new") { pending = true; break; }
    } catch {}
  }
  if (pending) await sendPushAll();
};
