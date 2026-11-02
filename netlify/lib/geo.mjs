// Vị trí quán và vùng giao hàng.
// Quán chỉnh vị trí chính xác ở trang quản lý (/#admin → Thông tin → Vị trí quán); khi chưa chỉnh thì dùng toạ độ mặc định dưới đây.
export const SHOP_DEFAULT = { lat: 10.4963, lng: 107.1684 }; // khu trung tâm Bà Rịa (gần đúng)
export const MAX_KM_DEFAULT = 10;

export function shopOf(info) {
  const lat = Number(info && info.lat), lng = Number(info && info.lng);
  const ok = Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && (lat || lng);
  const max = Number(info && info.maxKm);
  return { lat: ok ? lat : SHOP_DEFAULT.lat, lng: ok ? lng : SHOP_DEFAULT.lng, maxKm: max > 0 && max <= 100 ? max : MAX_KM_DEFAULT };
}

// Khoảng cách đường chim bay (km)
export function airKm(a, b) {
  const R = 6371, r = (x) => (x * Math.PI) / 180;
  const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Quãng đường đi xe theo bản đồ (OSRM, dữ liệu OpenStreetMap). Không gọi được thì ước chừng = chim bay × 1,3.
export async function roadKm(a, b) {
  try {
    const u = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=false`;
    const r = await fetch(u, { signal: AbortSignal.timeout(5000), headers: { "user-agent": "phengapp/1.0" } });
    const j = await r.json();
    if (j && j.code === "Ok" && j.routes && j.routes[0]) return { km: j.routes[0].distance / 1000, road: true };
  } catch {}
  return { km: airKm(a, b) * 1.3, road: false };
}

export const validLatLng = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng) && lat > 8 && lat < 24 && lng > 102 && lng < 110; // trong lãnh thổ Việt Nam
