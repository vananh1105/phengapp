import { getStore } from "@netlify/blobs";
export const config = { path: "/api/upload" };
export default async (req) => {
  if (req.method !== "POST") return new Response("", { status: 405 });
  if (!process.env.ADMIN_PASSWORD || req.headers.get("x-admin") !== process.env.ADMIN_PASSWORD)
    return new Response("no", { status: 401 });
  const buf = await req.arrayBuffer();
  const b = new Uint8Array(buf);
  if (buf.byteLength < 100 || buf.byteLength > 3_000_000 || b[0] !== 0xff || b[1] !== 0xd8)
    return new Response("bad image", { status: 400 });
  const id = crypto.randomUUID();
  await getStore("img").set(id, buf);
  return Response.json({ id });
};
