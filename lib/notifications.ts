/**
 * Push Notification Management
 * 
 * Handles:
 * - Service worker registration
 * - Push subscription
 * - Local notification scheduling
 * - Permission management
 */

const NOTIFICATION_SETTINGS_KEY = "swipe_notification_settings";

export interface NotificationSettings {
    enabled: boolean;
    dailyDigestTime: string; // HH:MM format
    lastNotificationSent: number;
    permissionGranted: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
    enabled: false,
    dailyDigestTime: "09:00",
    lastNotificationSent: 0,
    permissionGranted: false,
};

/**
 * Get notification settings
 */
export function getNotificationSettings(): NotificationSettings {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;

    try {
        const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
        if (!stored) return DEFAULT_SETTINGS;
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

/**
 * Save notification settings
 */
export function saveNotificationSettings(settings: Partial<NotificationSettings>): void {
    if (typeof window === "undefined") return;

    const current = getNotificationSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated));
}

/**
 * Check if notifications are supported
 */
export function isNotificationSupported(): boolean {
    return typeof window !== "undefined" &&
        "Notification" in window &&
        "serviceWorker" in navigator;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
    if (!isNotificationSupported()) return "unsupported";
    return Notification.permission;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (!isNotificationSupported()) {
        console.warn("[Notifications] Not supported in this browser");
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        const granted = permission === "granted";

        saveNotificationSettings({ permissionGranted: granted });

        if (granted) {
            // Register service worker if permission granted
            await registerServiceWorker();
        }

        return granted;
    } catch (error) {
        console.error("[Notifications] Permission request failed:", error);
        return false;
    }
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!("serviceWorker" in navigator)) {
        console.warn("[SW] Service workers not supported");
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/"
        });

        console.log("[SW] Registered successfully:", registration.scope);
        return registration;
    } catch (error) {
        console.error("[SW] Registration failed:", error);
        return null;
    }
}

/**
 * Show a local notification (no push server needed)
 */
export async function showLocalNotification(
    title: string,
    options?: NotificationOptions & { vibrate?: number[]; actions?: Array<{ action: string; title: string }> }
): Promise<boolean> {
    if (!isNotificationSupported()) return false;
    if (Notification.permission !== "granted") return false;

    try {
        const registration = await navigator.serviceWorker.ready;

        // Service worker showNotification supports additional options
        await registration.showNotification(title, {
            icon: "/icon.png",
            badge: "/icon.png",
            tag: "swipe-notification",
            ...options,
        } as NotificationOptions);

        return true;
    } catch (error) {
        console.error("[Notifications] Failed to show notification:", error);
        return false;
    }
}

/**
 * Schedule daily digest notification
 * Uses a simple approach: check on page load if it's time to notify
 */
export function checkAndSendDailyDigest(): void {
    const settings = getNotificationSettings();

    if (!settings.enabled || !settings.permissionGranted) return;
    if (Notification.permission !== "granted") return;

    const now = new Date();
    const [targetHour, targetMinute] = settings.dailyDigestTime.split(":").map(Number);

    // Check if we've already sent a notification today
    const lastSent = new Date(settings.lastNotificationSent);
    const isSameDay = lastSent.toDateString() === now.toDateString();

    if (isSameDay) return; // Already sent today

    // Check if it's past the target time
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const targetMinutes = targetHour * 60 + targetMinute;

    if (currentMinutes >= targetMinutes) {
        // Time to send!
        sendDailyDigest();
    }
}

/**
 * Send the daily digest notification
 */
async function sendDailyDigest(): Promise<void> {
    const success = await showLocalNotification("Time to clean your inbox! 📧", {
        body: "Your daily swipe session is ready. Let's hit Inbox Zero!",
        tag: "daily-digest",
        data: { url: "/swipe" },
    });

    if (success) {
        saveNotificationSettings({ lastNotificationSent: Date.now() });
        console.log("[Notifications] Daily digest sent");
    }
}

/**
 * Enable daily digest notifications
 */
export async function enableDailyDigest(time: string = "09:00"): Promise<boolean> {
    const granted = await requestNotificationPermission();

    if (granted) {
        saveNotificationSettings({
            enabled: true,
            dailyDigestTime: time,
        });
        return true;
    }

    return false;
}

/**
 * Disable daily digest notifications
 */
export function disableDailyDigest(): void {
    saveNotificationSettings({ enabled: false });
}
