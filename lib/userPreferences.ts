/**
 * User Preferences - localStorage persistence
 */

const STORAGE_KEY = "swipe_user_prefs";

export interface UserPreferences {
    lastMode: "swipe" | "dashboard" | null;
    hasCompletedOnboarding: boolean;
    lastVisit: number | null;
}

const DEFAULT_PREFS: UserPreferences = {
    lastMode: null,
    hasCompletedOnboarding: false,
    lastVisit: null,
};

export function getPreferences(): UserPreferences {
    if (typeof window === "undefined") return DEFAULT_PREFS;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return DEFAULT_PREFS;
        return { ...DEFAULT_PREFS, ...JSON.parse(stored) };
    } catch {
        return DEFAULT_PREFS;
    }
}

export function setPreferences(prefs: Partial<UserPreferences>): void {
    if (typeof window === "undefined") return;

    try {
        const current = getPreferences();
        const updated = { ...current, ...prefs };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
        console.error("Failed to save preferences:", err);
    }
}

export function getPreferredMode(): "swipe" | "dashboard" {
    const prefs = getPreferences();
    return prefs.lastMode || "swipe"; // Default to swipe for new users
}

export function setLastMode(mode: "swipe" | "dashboard"): void {
    setPreferences({ lastMode: mode, lastVisit: Date.now() });
}

export function markOnboardingComplete(): void {
    setPreferences({ hasCompletedOnboarding: true });
}

export function isReturningUser(): boolean {
    const prefs = getPreferences();
    return prefs.hasCompletedOnboarding;
}
