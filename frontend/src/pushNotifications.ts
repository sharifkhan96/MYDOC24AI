import { getVapidPublicKey, submitPushSubscription, deletePushSubscription } from "@/api/lifestyle";

export function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

function urlBase64ToUint8Array(base64Url: string) {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function getRegistration() {
  await navigator.serviceWorker.register("/sw.js");
  // register() can resolve before the worker is actually active; subscribe()
  // requires an active worker, so wait for the ready promise too.
  return navigator.serviceWorker.ready;
}

export async function enablePushReminders(): Promise<{ ok: boolean; reason?: string }> {
  if (!isPushSupported()) return { ok: false, reason: "Push notifications aren't supported in this browser." };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "Notification permission was not granted." };

  const { public_key } = await getVapidPublicKey();
  if (!public_key) return { ok: false, reason: "Push isn't configured on the server yet." };

  const registration = await getRegistration();
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(public_key),
    });
  }

  const json = subscription.toJSON();
  await submitPushSubscription({
    endpoint: json.endpoint!,
    p256dh: json.keys!.p256dh,
    auth: json.keys!.auth,
  });

  return { ok: true };
}

export async function disablePushReminders() {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) {
    await deletePushSubscription(subscription.endpoint);
    await subscription.unsubscribe();
  }
}
