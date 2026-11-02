import { getStore } from "@netlify/blobs";
import { getKeys, sendPushAll, subKey } from "../lib/push.mjs";
export const config = { path: "/api/push" };
const pw = () => (process.env.ADMIN_PASSWORD || "").trim();
const isAdmin = (req) => !!pw() && (req.headers.get("x-admin") || "").trim() === pw();
export default async (req) => {
  if (req.method === "GET") {
    const k = await getKeys();
    return Response.json({ key: k.pub }, { headers: { "cache-control": "no-store" } });
  }
  if (req.method === "POST") {
    if (!isAdmin(req)) return new Response("no", { status: 401 });
    let d;
    try { d = await req.json(); } catch { return new Response("bad", { status: 400 }); }
    if (d && d.test) {
      const results = await sendPushAll(new URL(req.url).origin);
      return Response.json({ ok: true, sent: results.filter((x) => x.ok).length, results });
    }
    if (!d || typeof d.endpoint !== "string" || !/^https:\/\//.test(d.endpoint) || d.endpoint.length > 1000)
      return new Response("bad", { status: 400 });
    await getStore({ name: "push", consistency: "strong" }).setJSON(subKey(d.endpoint), { endpoint: d.endpoint, at: new Date().toISOString() });
    return Response.json({ ok: true });
  }
  return new Response("", { status: 405 });
};
