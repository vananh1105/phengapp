self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
self.addEventListener("push", (e) => {
  e.waitUntil((async () => {
    const cl = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    cl.forEach((c) => c.postMessage({ t: "poll" }));
    await self.registration.showNotification("🧋 CÓ ĐƠN MỚI", {
      body: "Mở app và bấm Đã nhận đơn",
      tag: "order", renotify: true, requireInteraction: true,
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
