import { getStore } from "@netlify/blobs";
import { BANK, codeOf, payContent } from "../lib/pay.mjs";
export const config = { path: "/api/qr" };

// Trả ảnh mã QR thanh toán của một đơn để khách tải về máy (cùng tên miền nên trình duyệt cho tải).
// GET /api/qr?id=<mã đơn đầy đủ>
export default async (req) => {
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!/^\d{4}-\d\d-\d\dT[\d:.]+Z-[0-9a-f]{6}$/.test(id)) return new Response("bad", { status: 400 });
  let v = null;
  try { v = await getStore({ name: "orders", consistency: "strong" }).get(id, { type: "json" }); } catch {}
  if (!v || !v.amount) return new Response("missing", { status: 404 });
  const code = codeOf(id), des = encodeURIComponent(payContent(code)), amt = Math.round(v.amount);
  const urls = [
    `https://vietqr.app/img?bank=${encodeURIComponent(BANK.bank)}&acc=${BANK.acc}&template=compact&amount=${amt}&des=${des}&showinfo=true&holder=${encodeURIComponent(BANK.holder)}`,
    `https://qr.sepay.vn/img?acc=${BANK.acc}&bank=${encodeURIComponent(BANK.bank)}&amount=${amt}&des=${des}&template=compact`,
  ];
  for (const u of urls) {
    try {
      const r = await fetch(u, { signal: AbortSignal.timeout(6000) });
      const type = r.headers.get("content-type") || "";
      if (!r.ok || !type.startsWith("image/")) continue;
      const ext = type.includes("png") ? "png" : type.includes("svg") ? "svg" : "jpg";
      return new Response(await r.arrayBuffer(), { headers: {
        "content-type": type,
        "content-disposition": `attachment; filename="QR-PHENG-${code}.${ext}"`,
        "cache-control": "private, max-age=900",
      } });
    } catch {}
  }
  return new Response("qr unavailable", { status: 502 });
};
