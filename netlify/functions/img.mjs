import { getStore } from "@netlify/blobs";
export const config = { path: "/img/:id" };
export default async (req, context) => {
  const id = context.params.id;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("", { status: 404 });
  const data = await getStore("img").get(id, { type: "arrayBuffer" });
  if (!data) return new Response("", { status: 404 });
  return new Response(data, { headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=31536000, immutable" } });
};
