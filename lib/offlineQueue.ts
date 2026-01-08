/**
 * Offline Action Queue
 * 
 * Uses IndexedDB (native browser API) to store actions when offline.
 * Syncs automatically when connection is restored.
 * 
 * No third-party dependencies required.
 */

export interface QueuedAction {
    id: string;
    type: "trash" | "unsubscribe" | "block" | "keep" | "nuke";
    emailId?: string;
    senderEmail?: string;
    domain?: string;
    timestamp: number;
    retries: number;
}

const DB_NAME = "swipe_offline_queue";
const DB_VERSION = 1;
const STORE_NAME = "actions";

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
export function initOfflineQueue(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof window === "undefined" || !window.indexedDB) {
            console.warn("[OfflineQueue] IndexedDB not available");
            resolve();
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error("[OfflineQueue] Failed to open database");
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            console.log("[OfflineQueue] Database initialized");
            resolve();
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
                store.createIndex("timestamp", "timestamp", { unique: false });
                console.log("[OfflineQueue] Object store created");
            }
        };
    });
}

/**
 * Generate unique ID for actions
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Add action to offline queue
 */
export function queueAction(action: Omit<QueuedAction, "id" | "timestamp" | "retries">): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error("Database not initialized"));
            return;
        }

        const fullAction: QueuedAction = {
            ...action,
            id: generateId(),
            timestamp: Date.now(),
            retries: 0,
        };

        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(fullAction);

        request.onsuccess = () => {
            console.log(`[OfflineQueue] Queued action: ${fullAction.type}`);
            resolve(fullAction.id);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

/**
 * Get all pending actions
 */
export function getPendingActions(): Promise<QueuedAction[]> {
    return new Promise((resolve, reject) => {
        if (!db) {
            resolve([]);
            return;
        }

        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result || []);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

/**
 * Remove action from queue (after successful sync)
 */
export function removeAction(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!db) {
            resolve();
            return;
        }

        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => {
            console.log(`[OfflineQueue] Removed action: ${id}`);
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

/**
 * Update retry count for failed action
 */
export function incrementRetry(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!db) {
            resolve();
            return;
        }

        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const action = getRequest.result;
            if (action) {
                action.retries++;
                store.put(action);
            }
            resolve();
        };

        getRequest.onerror = () => {
            reject(getRequest.error);
        };
    });
}

/**
 * Get pending action count
 */
export function getPendingCount(): Promise<number> {
    return new Promise((resolve, reject) => {
        if (!db) {
            resolve(0);
            return;
        }

        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.count();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

/**
 * Clear all pending actions (use after successful bulk sync)
 */
export function clearQueue(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!db) {
            resolve();
            return;
        }

        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => {
            console.log("[OfflineQueue] Queue cleared");
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

/**
 * Check if browser is online
 */
export function isOnline(): boolean {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
}

/**
 * Sync pending actions to server
 */
export async function syncPendingActions(): Promise<{ synced: number; failed: number }> {
    if (!isOnline()) {
        console.log("[OfflineQueue] Offline, skipping sync");
        return { synced: 0, failed: 0 };
    }

    const pending = await getPendingActions();
    if (pending.length === 0) {
        return { synced: 0, failed: 0 };
    }

    console.log(`[OfflineQueue] Syncing ${pending.length} pending actions...`);

    let synced = 0;
    let failed = 0;

    for (const action of pending) {
        // Skip actions that have failed too many times
        if (action.retries >= 3) {
            console.warn(`[OfflineQueue] Skipping action ${action.id} (too many retries)`);
            await removeAction(action.id); // Remove permanently failed actions
            failed++;
            continue;
        }

        try {
            let endpoint = "";
            let payload: Record<string, unknown> = {};

            switch (action.type) {
                case "trash":
                    endpoint = "/api/gmail/emails";
                    payload = { action: "trash", emailId: action.emailId };
                    break;
                case "unsubscribe":
                    endpoint = "/api/gmail/unsubscribe";
                    payload = { emailId: action.emailId };
                    break;
                case "block":
                    endpoint = "/api/gmail/block";
                    payload = { senderEmail: action.senderEmail };
                    break;
                case "nuke":
                    endpoint = "/api/gmail/nuke";
                    payload = { domain: action.domain, confirm: true };
                    break;
                case "keep":
                    // Keep actions don't need server sync
                    await removeAction(action.id);
                    synced++;
                    continue;
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await removeAction(action.id);
                synced++;
            } else {
                await incrementRetry(action.id);
                failed++;
            }
        } catch (error) {
            console.error(`[OfflineQueue] Failed to sync action ${action.id}:`, error);
            await incrementRetry(action.id);
            failed++;
        }
    }

    console.log(`[OfflineQueue] Sync complete: ${synced} synced, ${failed} failed`);
    return { synced, failed };
}

/**
 * Set up automatic sync when coming online
 */
export function setupAutoSync(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("online", async () => {
        console.log("[OfflineQueue] Connection restored, syncing...");
        const result = await syncPendingActions();

        if (result.synced > 0) {
            // Dispatch event so UI can update
            window.dispatchEvent(new CustomEvent("offline_sync_complete", {
                detail: result
            }));
        }
    });

    // Also sync on visibility change (when user returns to tab)
    document.addEventListener("visibilitychange", async () => {
        if (document.visibilityState === "visible" && isOnline()) {
            await syncPendingActions();
        }
    });
}
