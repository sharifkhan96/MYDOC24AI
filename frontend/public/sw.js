// Minimal service worker whose only job is to show the daily check-in
// reminder push notification and focus/open the app when it's clicked.
self.addEventListener("push", (event) => {
  let payload = { title: "MyDoc24", body: "You have a new reminder.", url: "/app/lifestyle" };
  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      data: { url: payload.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/app/lifestyle";

  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = allClients.find((c) => new URL(c.url).pathname === url);
      if (existing) {
        existing.focus();
      } else {
        clients.openWindow(url);
      }
    })(),
  );
});
