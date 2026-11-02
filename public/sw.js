self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
self.addEventListener("push", (e) => {
  e.waitUntil((async () => {
    const cl = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    cl.forEach((c) => c.postMessage({ t: "poll" }));
    // Đóng thông báo cũ rồi hiện cái mới với tag khác để lần nào máy cũng kêu
    // (iPhone bỏ qua renotify nên thay cùng tag sẽ im lặng)
    const old = await self.registration.getNotifications();
    old.forEach((n) => { if (String(n.tag).indexOf("order") === 0) n.close(); });
    await self.registration.showNotification("🔔 CÓ ĐƠN HÀNG MỚI! CÓ ĐƠN HÀNG MỚI!", {
      body: "Mở app và bấm Đã nhận đơn",
      tag: "order-" + Date.now(), renotify: true, requireInteraction: true, silent: false,
      vibrate: [500, 200, 500, 200, 500, 200, 500], lang: "vi",
      icon: "/icon-192.png", badge: "/icon-192.png",
    });
  })());
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((l) => {
    for (const c of l) if (c.url.indexOf("/don.html") > -1 && "focus" in c) return c.focus();
    return self.clients.openWindow("/don.html");
  }));
});
