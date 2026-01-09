import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    getUsageStats,
    recordSwipe,
    getUserTier,
    setProUser,
    removeProStatus,
    canSwipe,
    getUsagePercentage,
} from '../freemium';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
    };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Freemium Usage', () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    describe('getUsageStats', () => {
        it('returns zero count for new users', () => {
            const stats = getUsageStats();
            expect(stats.swipeCount).toBe(0);
        });

        it('persists swipe count', () => {
            recordSwipe();
            recordSwipe();
            const stats = getUsageStats();
            expect(stats.swipeCount).toBe(2);
        });
    });

    describe('recordSwipe', () => {
        it('increments swipe count', () => {
            recordSwipe();
            recordSwipe();
            recordSwipe();
            const stats = getUsageStats();
            expect(stats.swipeCount).toBe(3);
        });

        it('updates lastSwipeTime', () => {
            const before = Date.now();
            const stats = recordSwipe();
            expect(stats.lastSwipeTime).toBeGreaterThanOrEqual(before);
        });
    });

    describe('getUserTier', () => {
        it('returns free tier by default', () => {
            const tier = getUserTier();
            expect(tier.isPro).toBe(false);
        });

        it('returns pro tier after setProUser', () => {
            setProUser();
            const tier = getUserTier();
            expect(tier.isPro).toBe(true);
        });
    });

    describe('setProUser', () => {
        it('sets isPro to true', () => {
            setProUser();
            const tier = getUserTier();
            expect(tier.isPro).toBe(true);
            expect(tier.proSince).toBeDefined();
        });

        it('stores expiration date when provided', () => {
            const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
            setProUser(expiresAt);
            const tier = getUserTier();
            expect(tier.proExpiresAt).toBe(expiresAt);
        });
    });

    describe('removeProStatus', () => {
        it('removes pro status', () => {
            setProUser();
            expect(getUserTier().isPro).toBe(true);
            removeProStatus();
            expect(getUserTier().isPro).toBe(false);
        });
    });

    describe('canSwipe', () => {
        it('allows swipes under limit for free users', () => {
            const result = canSwipe();
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(50);
            expect(result.limit).toBe(50);
        });

        it('blocks swipes when limit reached', () => {
            // Simulate 50 swipes
            for (let i = 0; i < 50; i++) {
                recordSwipe();
            }
            const result = canSwipe();
            expect(result.allowed).toBe(false);
            expect(result.remaining).toBe(0);
        });

        it('allows unlimited swipes for pro users', () => {
            setProUser();
            for (let i = 0; i < 100; i++) {
                recordSwipe();
            }
            const result = canSwipe();
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(Infinity);
        });
    });

    describe('getUsagePercentage', () => {
        it('returns 0 for no swipes', () => {
            expect(getUsagePercentage()).toBe(0);
        });

        it('returns correct percentage', () => {
            for (let i = 0; i < 25; i++) {
                recordSwipe();
            }
            expect(getUsagePercentage()).toBe(50);
        });

        it('returns 0 for pro users', () => {
            setProUser();
            for (let i = 0; i < 25; i++) {
                recordSwipe();
            }
            expect(getUsagePercentage()).toBe(0);
        });

        it('caps at 100%', () => {
            for (let i = 0; i < 60; i++) {
                recordSwipe();
            }
            expect(getUsagePercentage()).toBe(100);
        });
    });
});
