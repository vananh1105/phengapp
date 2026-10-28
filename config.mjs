import { getStore } from "@netlify/blobs";
export const config = { path: "/api/config" };
const isAdmin = (req) => !!process.env.ADMIN_PASSWORD && req.headers.get("x-admin") === process.env.ADMIN_PASSWORD;
export default async (req) => {
  const store = getStore("shop");
  if (req.method === "GET") {
    if (req.headers.get("x-admin") !== null)
      return isAdmin(req) ? Response.json({ ok: true }) : new Response("no", { status: 401 });
    const c = await store.get("config", { type: "json" });
    return Response.json(c || {}, { headers: { "cache-control": "no-store" } });
  }
  if (req.method === "POST") {
    if (!isAdmin(req)) return new Response("no", { status: 401 });
    const d = await req.json();
    if (!d || !Array.isArray(d.cats) || !Array.isArray(d.tops)) return new Response("bad", { status: 400 });
    await store.setJSON("config", d);
    return Response.json({ ok: true });
  }
  return new Response("", { status: 405 });
};
