import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";
const b64u = (b) => Buffer.from(b).toString("base64url");

export async function getKeys() {
  const st = getStore({ name: "push", consistency: "strong" });
  let k = await st.get("vapid", { type: "json" });
  if (!k) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" });
    const pub = publicKey.export({ format: "jwk" });
    const raw = Buffer.concat([Buffer.from([4]), Buffer.from(pub.x, "base64url"), Buffer.from(pub.y, "base64url")]);
    k = { pub: b64u(raw), jwk: privateKey.export({ format: "jwk" }) };
    await st.setJSON("vapid", k);
  }
  return k;
}

function subject(origin) {
  const raw = origin || process.env.URL || "";
  try { if (/^https:\/\//.test(raw)) return new URL(raw).origin; } catch {}
  return "mailto:admin@example.com";
}

function makeJwt(aud, k, sub) {
  const h = b64u(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const p = b64u(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub }));
  const key = crypto.createPrivateKey({ key: k.jwk, format: "jwk" });
  const sig = crypto.sign("sha256", Buffer.from(h + "." + p), { key, dsaEncoding: "ieee-p1363" });
  return h + "." + p + "." + b64u(sig);
}

export const subKey = (endpoint) => "sub:" + crypto.createHash("sha256").update(endpoint).digest("hex").slice(0, 32);

export async function sendPushAll(origin) {
  const st = getStore({ name: "push", consistency: "strong" });
  const k = await getKeys();
  const sub = subject(origin);
  const { blobs } = await st.list({ prefix: "sub:" });
  const results = [];
  await Promise.all(blobs.map(async ({ key }) => {
    let host = "?";
    try {
      const s = await st.get(key, { type: "json" });
      if (!s || !s.endpoint) return;
      const u = new URL(s.endpoint);
      host = u.hostname;
      const r = await fetch(s.endpoint, {
        method: "POST",
        signal: AbortSignal.timeout(5000),
        headers: { Authorization: `vapid t=${makeJwt(u.origin, k, sub)}, k=${k.pub}`, TTL: "3600", Urgency: "high" },
      });
      let info = "";
      if (r.status === 404 || r.status === 410) { await st.delete(key); info = "đăng ký đã hết hạn, đã xóa"; }
      else if (!r.ok) info = (await r.text().catch(() => "")).slice(0, 120);
      results.push({ host, status: r.status, ok: r.ok, info });
    } catch (e) {
      results.push({ host, status: 0, ok: false, info: String((e && e.message) || e).slice(0, 100) });
    }
  }));
  return results;
}
