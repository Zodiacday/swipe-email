/**
 * SWIPE-THEM Service Worker
 * 
 * Handles:
 * - Push notifications for daily digest
 * - Offline caching (future)
 * - Background sync (future)
 */

const SW_VERSION = '1.0.0';

// Install event
self.addEventListener('install', (event) => {
    console.log('[SW] Installing v' + SW_VERSION);
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('[SW] Activated v' + SW_VERSION);
    event.waitUntil(self.clients.claim());
});

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('[SW] Push received');

    let data = {
        title: 'Time to clean your inbox!',
        body: 'You have new emails waiting to be swiped.',
        icon: '/icon.png',
        badge: '/icon.png',
        tag: 'daily-digest',
        data: {
            url: '/swipe'
        }
    };

    // Try to parse push data if available
    if (event.data) {
        try {
            const pushData = event.data.json();
            data = { ...data, ...pushData };
        } catch (e) {
            console.log('[SW] Could not parse push data, using defaults');
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag,
        vibrate: [100, 50, 100],
        data: data.data,
        actions: [
            {
                action: 'open',
                title: 'Start Swiping'
            },
            {
                action: 'dismiss',
                title: 'Later'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click:', event.action);

    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    // Open or focus the app
    const urlToOpen = event.notification.data?.url || '/swipe';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if app is already open
                for (const client of clientList) {
                    if (client.url.includes(self.registration.scope) && 'focus' in client) {
                        client.navigate(urlToOpen);
                        return client.focus();
                    }
                }
                // Open new window if not
                if (self.clients.openWindow) {
                    return self.clients.openWindow(urlToOpen);
                }
            })
    );
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-actions') {
        event.waitUntil(syncOfflineActions());
    }
});

async function syncOfflineActions() {
    // This would sync IndexedDB actions when back online
    // Currently handled by the online event listener in offlineQueue.ts
    console.log('[SW] Syncing offline actions...');
}
