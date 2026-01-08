/**
 * SWIPE-THEM Analytics Utility
 * Manages persistent stats via localStorage
 */

const STORAGE_KEY = "swipe_analytics";

export interface SwipeAnalytics {
    totalEmailsTrashed: number;
    totalEmailsKept: number;
    totalSendersBlocked: number;
    totalNukes: number;
    weeklyStreak: number;
    lastActiveDate: string | null;
    firstUseDate: string;
}

const DEFAULT_ANALYTICS: SwipeAnalytics = {
    totalEmailsTrashed: 0,
    totalEmailsKept: 0,
    totalSendersBlocked: 0,
    totalNukes: 0,
    weeklyStreak: 0,
    lastActiveDate: null,
    firstUseDate: new Date().toISOString(),
};

/**
 * Get current analytics from localStorage
 */
export function getAnalytics(): SwipeAnalytics {
    if (typeof window === "undefined") return DEFAULT_ANALYTICS;

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return DEFAULT_ANALYTICS;
        return { ...DEFAULT_ANALYTICS, ...JSON.parse(saved) };
    } catch (err) {
        console.error("Failed to parse analytics:", err);
        return DEFAULT_ANALYTICS;
    }
}

/**
 * Update analytics based on an action
 */
export function updateAnalytics(action: "trash" | "keep" | "block" | "nuke", count: number = 1): SwipeAnalytics {
    const current = getAnalytics();
    const updated = { ...current };

    switch (action) {
        case "trash":
            updated.totalEmailsTrashed += count;
            break;
        case "keep":
            updated.totalEmailsKept += count;
            break;
        case "block":
            updated.totalSendersBlocked += 1;
            updated.totalEmailsTrashed += count;
            break;
        case "nuke":
            updated.totalNukes += 1;
            updated.totalEmailsTrashed += count;
            break;
    }

    // Update Streak
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    if (current.lastActiveDate) {
        const lastDate = new Date(current.lastActiveDate);
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 1) {
            updated.weeklyStreak += 1;
        } else if (diffDays > 1) {
            updated.weeklyStreak = 1; // Reset streak if missed a day
        }
    } else {
        updated.weeklyStreak = 1;
    }

    updated.lastActiveDate = today;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
        console.warn("Failed to save analytics:", err);
    }

    return updated;
}

/**
 * Estimate time saved in minutes
 * Approx 2 seconds per email processed
 */
export function getTimeSavedMinutes(): number {
    const stats = getAnalytics();
    const totalProcessed = stats.totalEmailsTrashed + stats.totalEmailsKept;
    return (totalProcessed * 2) / 60;
}
