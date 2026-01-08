"use client";

import { useEffect, useState, useCallback } from "react";
import {
    initOfflineQueue,
    queueAction,
    getPendingCount,
    syncPendingActions,
    isOnline,
    setupAutoSync,
    QueuedAction,
} from "@/lib/offlineQueue";

interface OfflineQueueState {
    initialized: boolean;
    pendingCount: number;
    isOnline: boolean;
    isSyncing: boolean;
}

export function useOfflineQueue() {
    const [state, setState] = useState<OfflineQueueState>({
        initialized: false,
        pendingCount: 0,
        isOnline: true,
        isSyncing: false,
    });

    // Initialize on mount
    useEffect(() => {
        let mounted = true;

        async function init() {
            try {
                await initOfflineQueue();
                setupAutoSync();

                const count = await getPendingCount();

                if (mounted) {
                    setState(prev => ({
                        ...prev,
                        initialized: true,
                        pendingCount: count,
                        isOnline: isOnline(),
                    }));
                }

                // Sync any pending actions if we're online
                if (isOnline() && count > 0) {
                    await syncPendingActions();
                    const newCount = await getPendingCount();
                    if (mounted) {
                        setState(prev => ({ ...prev, pendingCount: newCount }));
                    }
                }
            } catch (error) {
                console.error("[useOfflineQueue] Init failed:", error);
            }
        }

        init();

        // Listen for online/offline events
        const handleOnline = () => {
            setState(prev => ({ ...prev, isOnline: true }));
        };

        const handleOffline = () => {
            setState(prev => ({ ...prev, isOnline: false }));
        };

        const handleSyncComplete = async () => {
            const count = await getPendingCount();
            setState(prev => ({ ...prev, pendingCount: count }));
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        window.addEventListener("offline_sync_complete", handleSyncComplete);

        return () => {
            mounted = false;
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("offline_sync_complete", handleSyncComplete);
        };
    }, []);

    // Queue an action (used when offline or as fallback)
    const queue = useCallback(async (action: Omit<QueuedAction, "id" | "timestamp" | "retries">) => {
        const id = await queueAction(action);
        setState(prev => ({ ...prev, pendingCount: prev.pendingCount + 1 }));
        return id;
    }, []);

    // Force sync now
    const sync = useCallback(async () => {
        if (!state.isOnline || state.isSyncing) return { synced: 0, failed: 0 };

        setState(prev => ({ ...prev, isSyncing: true }));

        try {
            const result = await syncPendingActions();
            const count = await getPendingCount();
            setState(prev => ({ ...prev, pendingCount: count, isSyncing: false }));
            return result;
        } catch (error) {
            setState(prev => ({ ...prev, isSyncing: false }));
            throw error;
        }
    }, [state.isOnline, state.isSyncing]);

    return {
        ...state,
        queue,
        sync,
    };
}
