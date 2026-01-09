import { describe, it, expect } from 'vitest';
import { aggregateEmails, AggregatedSender, DashboardStats } from '../aggregation';
import { NormalizedEmail } from '../../types';

// Mock email factory
function createMockEmail(sender: string, overrides: Partial<NormalizedEmail> = {}): NormalizedEmail {
    const domain = sender.split('@')[1] || 'example.com';
    return {
        id: `id-${Math.random()}`,
        provider: 'gmail',
        providerId: 'p1',
        sender,
        senderName: sender.split('@')[0],
        senderDomain: domain,
        subject: 'Test Subject',
        preview: 'Test preview text',
        receivedAt: '2024-01-01',
        timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
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

describe('aggregateEmails', () => {
    it('correctly aggregates emails by sender', () => {
        const emails = [
            createMockEmail('alice@example.com'),
            createMockEmail('alice@example.com'),
            createMockEmail('bob@example.com'),
        ];

        const result = aggregateEmails(emails);

        expect(result.senders).toHaveLength(2);

        const alice = result.senders.find(s => s.email === 'alice@example.com');
        const bob = result.senders.find(s => s.email === 'bob@example.com');

        expect(alice?.count).toBe(2);
        expect(bob?.count).toBe(1);
    });

    it('calculates correct stats', () => {
        const emails = [
            createMockEmail('alice@example.com', { size: 10000 }),
            createMockEmail('bob@example.com', { size: 20000 }),
            createMockEmail('charlie@example.com', { size: 30000 }),
        ];

        const result = aggregateEmails(emails);

        expect(result.stats.totalEmails).toBe(3);
        expect(result.stats.uniqueSenders).toBe(3);
        expect(result.stats.storageEstimate).toBe(60000);
    });

    it('handles empty email array', () => {
        const result = aggregateEmails([]);

        expect(result.senders).toHaveLength(0);
        expect(result.stats.totalEmails).toBe(0);
        expect(result.stats.uniqueSenders).toBe(0);
    });

    it('sorts by danger score then count', () => {
        // Create emails with different characteristics
        const emails = [
            // Low volume sender
            createMockEmail('lowvolume@example.com'),
            // High volume sender (should rank higher)
            ...Array(20).fill(null).map(() => createMockEmail('highvolume@spam.com', {
                listUnsubscribe: { http: 'https://unsubscribe.example.com', mailto: null },
            })),
        ];

        const result = aggregateEmails(emails);

        // High volume sender with unsubscribe link should be first
        expect(result.senders[0].email).toBe('highvolume@spam.com');
    });

    it('collects sample subjects (up to 5)', () => {
        const emails = Array(10).fill(null).map((_, i) =>
            createMockEmail('sender@example.com', { subject: `Subject ${i}` })
        );

        const result = aggregateEmails(emails);

        expect(result.senders[0].sampleSubjects).toHaveLength(5);
    });

    it('tracks oldest email timestamp', () => {
        const oldTimestamp = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days ago
        const emails = [
            createMockEmail('sender@example.com', { timestamp: Date.now() }),
            createMockEmail('sender@example.com', { timestamp: oldTimestamp }),
        ];

        const result = aggregateEmails(emails);

        expect(result.stats.oldestEmail).toBe(oldTimestamp);
    });

    it('uses most recent email for lastActive', () => {
        const recentTimestamp = Date.now();
        const oldTimestamp = Date.now() - 7 * 24 * 60 * 60 * 1000;

        const emails = [
            createMockEmail('sender@example.com', { timestamp: oldTimestamp }),
            createMockEmail('sender@example.com', { timestamp: recentTimestamp }),
        ];

        const result = aggregateEmails(emails);
        const sender = result.senders[0];

        expect(sender.lastActive).toBe(recentTimestamp);
    });
});
