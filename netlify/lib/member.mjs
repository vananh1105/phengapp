import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

// Thành viên = số điện thoại + mã PIN 4 số. Lưu PIN dạng băm, không lưu PIN gốc.
export const store = () => getStore({ name: "members", consistency: "strong" });
export const normPhone = (s) => {
  let d = String(s || "").replace(/\D/g, "");
  if (d.startsWith("84") && d.length === 11) d = "0" + d.slice(2);
  return d;
};
export const validPin = (p) => /^\d{4}$/.test(String(p || ""));
const hash = (pin, salt) => crypto.scryptSync(String(pin), salt, 32).toString("hex");
const MAX_FAIL = 5, LOCK_MS = 15 * 60000;

// Trả về { m, st }: st = "new" (chưa có PIN, vừa tạo) | "ok" | "wrong" | "locked"
export async function checkPin(phone, pin, { create = false } = {}) {
  const key = "m:" + phone, s = store();
  let m = await s.get(key, { type: "json" });
  if (!m || !m.h) {
    if (!create) return { m: null, st: "none" };
    const salt = crypto.randomBytes(16).toString("hex");
    m = { ...(m || {}), salt, h: hash(pin, salt), orders: (m && m.orders) || [], fails: 0, lock: 0, at: new Date().toISOString() };
    await s.setJSON(key, m);
    return { m, st: "new" };
  }
  if (m.lock && Date.now() < m.lock) return { m, st: "locked" };
  const ok = crypto.timingSafeEqual(Buffer.from(hash(pin, m.salt), "hex"), Buffer.from(m.h, "hex"));
  if (ok) {
    if (m.fails || m.lock) { m.fails = 0; m.lock = 0; await s.setJSON(key, m); }
    return { m, st: "ok" };
  }
  m.fails = (m.fails || 0) + 1;
  if (m.fails >= MAX_FAIL) { m.fails = 0; m.lock = Date.now() + LOCK_MS; }
  await s.setJSON(key, m);
  return { m, st: m.lock && Date.now() < m.lock ? "locked" : "wrong" };
}

export async function addOrder(phone, id) {
  const key = "m:" + phone, s = store();
  const m = await s.get(key, { type: "json" });
  if (!m) return;
  m.orders = [id, ...(m.orders || []).filter((x) => x !== id)].slice(0, 50);
  await s.setJSON(key, m);
}

// Quán đặt lại PIN: xóa PIN cũ, giữ lịch sử đơn; lần đặt tới khách tự đặt PIN mới
export async function resetPin(phone) {
  const key = "m:" + phone, s = store();
  const m = await s.get(key, { type: "json" });
  if (!m) return false;
  delete m.h; delete m.salt; m.fails = 0; m.lock = 0;
  await s.setJSON(key, m);
  return true;
}
