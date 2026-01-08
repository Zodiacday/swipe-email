"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getUsageStats,
    recordSwipe,
    getUserTier,
    canSwipe,
    getUsagePercentage,
    formatTimeUntilReset,
    UsageStats,
    UserTier,
} from "@/lib/freemium";

interface FreemiumState {
    stats: UsageStats;
    tier: UserTier;
    canSwipe: boolean;
    remaining: number;
    limit: number;
    usagePercent: number;
    timeUntilReset: string;
}

export function useFreemium() {
    const [state, setState] = useState<FreemiumState>({
        stats: { date: "", swipeCount: 0, lastSwipeTime: 0 },
        tier: { isPro: false },
        canSwipe: true,
        remaining: 50,
        limit: 50,
        usagePercent: 0,
        timeUntilReset: "",
    });

    // Refresh state
    const refresh = useCallback(() => {
        const stats = getUsageStats();
        const tier = getUserTier();
        const swipeCheck = canSwipe();
        const usagePercent = getUsagePercentage();
        const timeUntilReset = formatTimeUntilReset();

        setState({
            stats,
            tier,
            canSwipe: swipeCheck.allowed,
            remaining: swipeCheck.remaining,
            limit: swipeCheck.limit,
            usagePercent,
            timeUntilReset,
        });
    }, []);

    // Initialize on mount
    useEffect(() => {
        refresh();

        // Update time until reset every minute
        const interval = setInterval(refresh, 60000);
        return () => clearInterval(interval);
    }, [refresh]);

    // Record a swipe and update state
    const doSwipe = useCallback(() => {
        if (!state.canSwipe && !state.tier.isPro) {
            return false;
        }

        recordSwipe();
        refresh();
        return true;
    }, [state.canSwipe, state.tier.isPro, refresh]);

    return {
        ...state,
        doSwipe,
        refresh,
    };
}
