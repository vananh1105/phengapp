self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});

// Mật khẩu quản lý do trang don.html lưu vào IndexedDB, để thông báo hỏi được tóm tắt đơn mới nhất
function getPw() {
  return new Promise((res) => {
    try {
      const rq = indexedDB.open("osugar", 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore("kv");
      rq.onerror = () => res("");
      rq.onsuccess = () => {
        try {
          const g = rq.result.transaction("kv", "readonly").objectStore("kv").get("pw");
          g.onsuccess = () => res(g.result || "");
          g.onerror = () => res("");
        } catch { res(""); }
      };
    } catch { res(""); }
  });
}
const fmt = (k) => Math.round(k * 1000).toLocaleString("vi-VN") + "đ";

async function lastOrder() {
  try {
    const pw = await getPw();
    if (!pw) return null;
    const r = await fetch("/api/push?last=1", { headers: { "x-admin": pw }, cache: "no-store" });
    if (!r.ok) return null;
    const d = await r.json();
    return d && (d.code || d.test) && Date.now() - (d.at || 0) < 10 * 60000 ? d : null; // chỉ dùng tóm tắt trong 10 phút gần nhất
  } catch { return null; }
}

self.addEventListener("push", (e) => {
  e.waitUntil((async () => {
    const cl = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    cl.forEach((c) => c.postMessage({ t: "poll" }));
    // Đóng thông báo cũ rồi hiện cái mới với tag khác để lần nào máy cũng kêu
    // (iPhone bỏ qua renotify nên thay cùng tag sẽ im lặng)
    const old = await self.registration.getNotifications();
    old.forEach((n) => { if (String(n.tag).indexOf("order") === 0) n.close(); });
    const d = await lastOrder();
    let title = "🔔 CÓ ĐƠN MỚI! · O Sugar", body = "Mở app và bấm Đã nhận đơn nhé";
    if (d && d.test) { title = "🔔 Thông báo thử · O Sugar"; body = "Máy này đã nhận được thông báo đơn mới 🐈‍⬛"; }
    else if (d) {
      title = "🔔 CÓ ĐƠN MỚI! #" + d.code;
      body = [fmt(d.total || 0), "đã thanh toán", (d.cups || 0) + " ly", d.ship ? "giao" + (d.km != null ? " " + String(d.km).replace(".", ",") + " km" : "") : "nhận tại quán"].join(" · ");
    }
    await self.registration.showNotification(title, {
      body,
      tag: "order-" + Date.now(), renotify: true, requireInteraction: true, silent: false,
      vibrate: [500, 200, 500, 200, 500, 200, 500], lang: "vi",
      icon: "/don-icon-192.png", badge: "/don-badge-96.png", image: "/don-push-big.png",
      actions: [{ action: "open", title: "Mở đơn" }, { action: "mute", title: "Tắt chuông" }],
    });
  })());
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((l) => {
    // "Tắt chuông": tắt tiếng chuông trên trang quản lý đang mở, không mở app
    if (e.action === "mute" && l.length) { l.forEach((c) => c.postMessage({ t: "mute" })); return; }
    for (const c of l) if (c.url.indexOf("/don.html") > -1 && "focus" in c) return c.focus();
    return self.clients.openWindow("/don.html");
  }));
});
