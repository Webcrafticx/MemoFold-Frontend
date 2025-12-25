import config from "../hooks/config";

    export const enablePushNotifications = async (userId) => {
    const token = localStorage.getItem("token");
    if (!("serviceWorker" in navigator)) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;
        console.log("Permission for notifications granted.");
    const reg = await navigator.serviceWorker.ready;
const vapidKey = "BOnV7Iahzb3TQi6WhFgMw9wB9F9adO9Y6iUHJ9NgQVjDj5LgHC8MlxxKcgUp_L8QkhWt7bONtkcK_PvIGcpAmhA";
    if (!vapidKey) {
        console.error("VAPID public key is not defined.");
        return;
    }

    const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
            vapidKey
        ),
    });

    console.log("Push Subscription:", sub);
   

    await fetch(`${config.apiUrl}/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
        Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subscription: sub, userId }),
    });

    console.log("Push subscription sent to server.");
    };

    function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
    }
