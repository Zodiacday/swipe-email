/**
 * Freemium Usage Tracking
 * 
 * Tracks daily swipe counts and enforces limits for free users.
 * Pro users have unlimited swipes.
 * 
 * Storage: localStorage (resets daily)
 */

export interface UsageStats {
    date: string; // YYYY-MM-DD
    swipeCount: number;
    lastSwipeTime: number;
}

export interface UserTier {
    isPro: boolean;
    proSince?: number; // timestamp
    proExpiresAt?: number; // timestamp for subscriptions
}

const USAGE_KEY = "swipe_daily_usage";
const TIER_KEY = "swipe_user_tier";
const FREE_DAILY_LIMIT = 50;

function getToday(): string {
    return new Date().toISOString().split("T")[0];
}

/**
 * Get current usage stats (resets daily)
 */
export function getUsageStats(): UsageStats {
    if (typeof window === "undefined") {
        return { date: getToday(), swipeCount: 0, lastSwipeTime: 0 };
    }

    try {
        const stored = localStorage.getItem(USAGE_KEY);
        if (!stored) {
            return { date: getToday(), swipeCount: 0, lastSwipeTime: 0 };
        }

        const stats: UsageStats = JSON.parse(stored);

        // Reset if new day
        if (stats.date !== getToday()) {
            const newStats = { date: getToday(), swipeCount: 0, lastSwipeTime: 0 };
            localStorage.setItem(USAGE_KEY, JSON.stringify(newStats));
            return newStats;
        }

        return stats;
    } catch {
        return { date: getToday(), swipeCount: 0, lastSwipeTime: 0 };
    }
}

/**
 * Record a swipe action
 */
export function recordSwipe(): UsageStats {
    const stats = getUsageStats();
    stats.swipeCount++;
    stats.lastSwipeTime = Date.now();

    if (typeof window !== "undefined") {
        localStorage.setItem(USAGE_KEY, JSON.stringify(stats));
    }

    return stats;
}

/**
 * Get user tier (free or pro)
 */
export function getUserTier(): UserTier {
    if (typeof window === "undefined") {
        return { isPro: false };
    }

    try {
        const stored = localStorage.getItem(TIER_KEY);
        if (!stored) {
            return { isPro: false };
        }

        const tier: UserTier = JSON.parse(stored);

        // Check if pro has expired
        if (tier.proExpiresAt && tier.proExpiresAt < Date.now()) {
            const expiredTier = { isPro: false };
            localStorage.setItem(TIER_KEY, JSON.stringify(expiredTier));
            return expiredTier;
        }

        return tier;
    } catch {
        return { isPro: false };
    }
}

/**
 * Set user as pro (called after successful payment)
 */
export function setProUser(expiresAt?: number): void {
    if (typeof window === "undefined") return;

    const tier: UserTier = {
        isPro: true,
        proSince: Date.now(),
        proExpiresAt: expiresAt,
    };

    localStorage.setItem(TIER_KEY, JSON.stringify(tier));
}

/**
 * Remove pro status (for testing or cancellation)
 */
export function removeProStatus(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TIER_KEY, JSON.stringify({ isPro: false }));
}

/**
 * Check if user can swipe
 */
export function canSwipe(): { allowed: boolean; remaining: number; limit: number } {
    const tier = getUserTier();

    // Pro users have unlimited swipes
    if (tier.isPro) {
        return { allowed: true, remaining: Infinity, limit: Infinity };
    }

    const stats = getUsageStats();
    const remaining = Math.max(0, FREE_DAILY_LIMIT - stats.swipeCount);

    return {
        allowed: remaining > 0,
        remaining,
        limit: FREE_DAILY_LIMIT,
    };
}

/**
 * Get usage percentage (0-100)
 */
export function getUsagePercentage(): number {
    const tier = getUserTier();
    if (tier.isPro) return 0; // Pro users don't have usage bar

    const stats = getUsageStats();
    return Math.min(100, (stats.swipeCount / FREE_DAILY_LIMIT) * 100);
}

/**
 * Get time until daily reset (in milliseconds)
 */
export function getTimeUntilReset(): number {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
}

/**
 * Format time until reset as string
 */
export function formatTimeUntilReset(): string {
    const ms = getTimeUntilReset();
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}
