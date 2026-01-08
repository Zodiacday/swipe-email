"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getNotificationSettings,
    getNotificationPermission,
    requestNotificationPermission,
    enableDailyDigest,
    disableDailyDigest,
    checkAndSendDailyDigest,
    isNotificationSupported,
    registerServiceWorker,
    NotificationSettings,
} from "@/lib/notifications";

interface NotificationState {
    supported: boolean;
    permission: NotificationPermission | "unsupported";
    settings: NotificationSettings;
    isLoading: boolean;
}

export function useNotifications() {
    const [state, setState] = useState<NotificationState>({
        supported: false,
        permission: "unsupported",
        settings: {
            enabled: false,
            dailyDigestTime: "09:00",
            lastNotificationSent: 0,
            permissionGranted: false,
        },
        isLoading: true,
    });

    // Initialize on mount
    useEffect(() => {
        const supported = isNotificationSupported();
        const permission = getNotificationPermission();
        const settings = getNotificationSettings();

        setState({
            supported,
            permission,
            settings,
            isLoading: false,
        });

        // Register service worker and check for daily digest
        if (supported && permission === "granted") {
            registerServiceWorker();
            checkAndSendDailyDigest();
        }
    }, []);

    // Request permission
    const requestPermission = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true }));

        const granted = await requestNotificationPermission();

        setState(prev => ({
            ...prev,
            permission: granted ? "granted" : "denied",
            settings: { ...prev.settings, permissionGranted: granted },
            isLoading: false,
        }));

        return granted;
    }, []);

    // Enable daily digest
    const enableDigest = useCallback(async (time: string = "09:00") => {
        setState(prev => ({ ...prev, isLoading: true }));

        const success = await enableDailyDigest(time);

        if (success) {
            setState(prev => ({
                ...prev,
                settings: { ...prev.settings, enabled: true, dailyDigestTime: time },
                isLoading: false,
            }));
        } else {
            setState(prev => ({ ...prev, isLoading: false }));
        }

        return success;
    }, []);

    // Disable daily digest
    const disableDigest = useCallback(() => {
        disableDailyDigest();
        setState(prev => ({
            ...prev,
            settings: { ...prev.settings, enabled: false },
        }));
    }, []);

    return {
        ...state,
        requestPermission,
        enableDigest,
        disableDigest,
    };
}
