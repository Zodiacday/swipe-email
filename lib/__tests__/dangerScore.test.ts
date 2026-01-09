import { describe, it, expect, beforeEach } from 'vitest';
import { calculateDangerScore, getDangerLevel, getDangerColor, getDangerBadge } from '../dangerScore';
import { NormalizedEmail } from '../types';

// Mock email factory
function createMockEmail(overrides: Partial<NormalizedEmail> = {}): NormalizedEmail {
    return {
        id: 'test-id',
        provider: 'gmail',
        providerId: 'p1',
        sender: 'test@example.com',
        senderName: 'Test Sender',
        senderDomain: 'example.com',
        subject: 'Test Subject',
        preview: 'Test preview text',
        receivedAt: '2024-01-01',
        timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
        labels: [],
        category: 'unknown',
        size: 50000,
        isRead: false,
        metadata: {},
        headers: {},
        listUnsubscribe: { http: null, mailto: null },
        ...overrides,
    } as NormalizedEmail;
}

describe('calculateDangerScore', () => {
    it('returns higher score for high volume senders', () => {
        const lowVolumeScore = calculateDangerScore({
            email: createMockEmail(),
            count: 2,
            lastActive: Date.now(),
            allSubjects: ['Hello'],
        });

        const highVolumeScore = calculateDangerScore({
            email: createMockEmail(),
            count: 50,
            lastActive: Date.now(),
            allSubjects: ['Hello'],
        });

        expect(highVolumeScore).toBeGreaterThan(lowVolumeScore);
    });

    it('returns higher score for stale senders (90+ days inactive)', () => {
        const now = Date.now();
        const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;

        const activeScore = calculateDangerScore({
            email: createMockEmail(),
            count: 5,
            lastActive: now,
            allSubjects: ['Hello'],
        });

        const staleScore = calculateDangerScore({
            email: createMockEmail(),
            count: 5,
            lastActive: ninetyDaysAgo,
            allSubjects: ['Hello'],
        });

        expect(staleScore).toBeGreaterThan(activeScore);
    });

    it('boosts score for spam keywords in subjects', () => {
        const normalScore = calculateDangerScore({
            email: createMockEmail(),
            count: 5,
            lastActive: Date.now(),
            allSubjects: ['Regular update'],
        });

        const spamScore = calculateDangerScore({
            email: createMockEmail(),
            count: 5,
            lastActive: Date.now(),
            allSubjects: ['URGENT! Limited time SALE - 50% off!'],
        });

        expect(spamScore).toBeGreaterThan(normalScore);
    });

    it('reduces score for important keywords', () => {
        const normalScore = calculateDangerScore({
            email: createMockEmail(),
            count: 5,
            lastActive: Date.now(),
            allSubjects: ['Newsletter update'],
        });

        const importantScore = calculateDangerScore({
            email: createMockEmail(),
            count: 5,
            lastActive: Date.now(),
            allSubjects: ['Your invoice is ready', 'Payment confirmation'],
        });

        expect(importantScore).toBeLessThan(normalScore);
    });

    it('boosts score for emails with unsubscribe links', () => {
        const withoutUnsubscribe = calculateDangerScore({
            email: createMockEmail({ listUnsubscribe: undefined }),
            count: 5,
            lastActive: Date.now(),
            allSubjects: ['Hello'],
        });

        const withUnsubscribe = calculateDangerScore({
            email: createMockEmail({ listUnsubscribe: { http: 'https://unsubscribe.example.com', mailto: null } }),
            count: 5,
            lastActive: Date.now(),
            allSubjects: ['Hello'],
        });

        expect(withUnsubscribe).toBeGreaterThan(withoutUnsubscribe);
    });

    it('returns score between 0 and 100', () => {
        const score = calculateDangerScore({
            email: createMockEmail(),
            count: 100,
            lastActive: Date.now() - 100 * 24 * 60 * 60 * 1000,
            allSubjects: ['URGENT SALE LIMITED TIME FREE'],
        });

        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
    });
});

describe('getDangerLevel', () => {
    it('returns correct levels for score ranges', () => {
        expect(getDangerLevel(0)).toBe('low');
        expect(getDangerLevel(29)).toBe('low');
        expect(getDangerLevel(30)).toBe('medium');
        expect(getDangerLevel(49)).toBe('medium');
        expect(getDangerLevel(50)).toBe('high');
        expect(getDangerLevel(69)).toBe('high');
        expect(getDangerLevel(70)).toBe('danger');
        expect(getDangerLevel(100)).toBe('danger');
    });
});

describe('getDangerColor', () => {
    it('returns correct color classes', () => {
        expect(getDangerColor(0)).toBe('text-zinc-400');
        expect(getDangerColor(30)).toBe('text-amber-400');
        expect(getDangerColor(50)).toBe('text-orange-400');
        expect(getDangerColor(70)).toBe('text-red-500');
    });
});

describe('getDangerBadge', () => {
    it('returns correct badge properties for danger level', () => {
        const badge = getDangerBadge(75);
        expect(badge.label).toBe('DANGER');
        expect(badge.text).toBe('text-red-400');
    });

    it('returns correct badge properties for low level', () => {
        const badge = getDangerBadge(10);
        expect(badge.label).toBe('LOW');
        expect(badge.text).toBe('text-zinc-400');
    });
});
