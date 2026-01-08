/**
 * userStats - Streak and progress tracking system
 * Stored in localStorage for privacy
 */

export interface UserStats {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string; // ISO date string (YYYY-MM-DD)
    totalProcessed: number;
    totalTrashed: number;
    totalUnsubscribed: number;
    weeklyProcessed: number;
    weekStart: string; // ISO date of week start
    bestTimeToZero: number | null; // milliseconds
    lastSessionTime: number | null; // milliseconds
}

const STORAGE_KEY = "swipe_user_stats";

function getToday(): string {
    return new Date().toISOString().split("T")[0];
}

function getWeekStart(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split("T")[0];
}

function getDefaultStats(): UserStats {
    return {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: "",
        totalProcessed: 0,
        totalTrashed: 0,
        totalUnsubscribed: 0,
        weeklyProcessed: 0,
        weekStart: getWeekStart(),
        bestTimeToZero: null,
        lastSessionTime: null,
    };
}

export function loadStats(): UserStats {
    if (typeof window === "undefined") return getDefaultStats();

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return getDefaultStats();

        const stats: UserStats = JSON.parse(stored);

        // Reset weekly stats if new week
        const currentWeekStart = getWeekStart();
        if (stats.weekStart !== currentWeekStart) {
            stats.weeklyProcessed = 0;
            stats.weekStart = currentWeekStart;
        }

        return stats;
    } catch {
        return getDefaultStats();
    }
}

export function saveStats(stats: UserStats): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function recordActivity(processed: number, trashed: number, unsubscribed: number = 0): UserStats {
    const stats = loadStats();
    const today = getToday();

    // Update streak
    if (stats.lastActiveDate === today) {
        // Already active today, just update counts
    } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (stats.lastActiveDate === yesterdayStr) {
            // Consecutive day
            stats.currentStreak += 1;
        } else if (stats.lastActiveDate === "") {
            // First ever activity
            stats.currentStreak = 1;
        } else {
            // Streak broken
            stats.currentStreak = 1;
        }

        stats.lastActiveDate = today;
    }

    // Update longest streak
    if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
    }

    // Update counts
    stats.totalProcessed += processed;
    stats.totalTrashed += trashed;
    stats.totalUnsubscribed += unsubscribed;
    stats.weeklyProcessed += processed;

    saveStats(stats);
    return stats;
}

export function recordSessionTime(timeMs: number): { isNewRecord: boolean; stats: UserStats } {
    const stats = loadStats();
    const isNewRecord = stats.bestTimeToZero === null || timeMs < stats.bestTimeToZero;

    if (isNewRecord) {
        stats.bestTimeToZero = timeMs;
    }
    stats.lastSessionTime = timeMs;

    saveStats(stats);
    return { isNewRecord, stats };
}

export function formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

export function getStreakEmoji(streak: number): string {
    if (streak >= 7) return "🔥🔥🔥";
    if (streak >= 3) return "🔥🔥";
    if (streak >= 1) return "🔥";
    return "";
}

export function getStreakLabel(streak: number): string {
    if (streak >= 7) return "ON FIRE";
    if (streak >= 3) return "Hot streak";
    if (streak >= 1) return `${streak} day streak`;
    return "Start your streak!";
}
