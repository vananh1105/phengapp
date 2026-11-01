import { getStore } from "@netlify/blobs";
export const config = { path: "/api/orders" };
const pw = () => (process.env.ADMIN_PASSWORD || "").trim();
const isAdmin = (req) => !!pw() && (req.headers.get("x-admin") || "").trim() === pw();
export default async (req) => {
  if (!isAdmin(req)) return new Response("no", { status: 401 });
  const store = getStore({ name: "orders", consistency: "strong" });
  if (req.method === "GET") {
    const day = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
    const lists = await Promise.all([day(0), day(1)].map((p) => store.list({ prefix: p })));
    const keys = lists.flatMap((l) => l.blobs.map((b) => b.key)).sort();
    const out = await Promise.all(keys.slice(-80).map(async (id) => {
      try {
        const v = await store.get(id, { type: "json" });
        return v && typeof v === "object" && v.t ? { id, ...v } : null;
      } catch {
        try { return { id, t: await store.get(id), s: "done", at: id.slice(0, 24), total: 0, name: "", phone: "" }; } catch { return null; }
      }
    }));
    return Response.json({ orders: out.filter(Boolean).reverse() }, { headers: { "cache-control": "no-store" } });
  }
  if (req.method === "POST") {
    let d;
    try { d = await req.json(); } catch { return new Response("bad", { status: 400 }); }
    if (!d || typeof d.id !== "string" || !["new", "doing", "done"].includes(d.s)) return new Response("bad", { status: 400 });
    const v = await store.get(d.id, { type: "json" });
    if (!v || typeof v !== "object") return new Response("missing", { status: 404 });
    v.s = d.s;
    await store.setJSON(d.id, v);
    return Response.json({ ok: true });
  }
  return new Response("", { status: 405 });
};
