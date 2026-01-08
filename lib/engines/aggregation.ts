import { NormalizedEmail, DOMAIN_SAFETY } from "@/lib/types";
import { calculateDangerScore } from "@/lib/dangerScore";

export interface AggregatedSender {
    id: string;      // generated from email/domain
    name: string;    // Human readable name
    email: string;   // sender email address
    domain: string;
    count: number;
    lastActive: number; // timestamp
    category: "Promotion" | "Social" | "Update" | "Personal";
    score: number;   // 0-100 nuisance score
    sampleSubjects: string[]; // Up to 5 sample subjects for preview
}

export interface DashboardStats {
    totalEmails: number;
    uniqueSenders: number;
    storageEstimate: number; // in bytes (rough guess)
    oldestEmail: number;
}

interface SenderAccumulator {
    name: string;
    email: string;
    domain: string;
    count: number;
    lastActive: number;
    sampleSubjects: string[];
    latestEmail: NormalizedEmail;
}

export function aggregateEmails(emails: NormalizedEmail[]) {
    const start = performance.now();
    const sendersMap = new Map<string, SenderAccumulator>();
    const stats: DashboardStats = {
        totalEmails: 0,
        uniqueSenders: 0,
        storageEstimate: 0,
        oldestEmail: Date.now()
    };

    emails.forEach(email => {
        // 1. Update Global Stats
        stats.totalEmails++;
        // Use actual email size if available, otherwise estimate 50KB
        stats.storageEstimate += email.size || 50 * 1024;

        if (email.timestamp < stats.oldestEmail) {
            stats.oldestEmail = email.timestamp;
        }

        // 2. Aggregate by Sender
        const senderKey = email.sender.toLowerCase();

        if (!sendersMap.has(senderKey)) {
            sendersMap.set(senderKey, {
                name: email.senderName || email.sender.split('@')[0],
                email: email.sender,
                domain: email.senderDomain,
                count: 0,
                lastActive: 0,
                sampleSubjects: [],
                latestEmail: email
            });
        }

        const sender = sendersMap.get(senderKey)!;
        sender.count++;
        if (email.timestamp > sender.lastActive) {
            sender.lastActive = email.timestamp;
            sender.latestEmail = email; // Keep the most recent email for scoring
        }

        // Collect up to 5 sample subjects
        if (sender.sampleSubjects.length < 5 && email.subject) {
            sender.sampleSubjects.push(email.subject);
        }
    });

    stats.uniqueSenders = sendersMap.size;

    // Convert to AggregatedSender with smart scoring
    const senders: AggregatedSender[] = Array.from(sendersMap.entries()).map(([key, acc]) => {
        // Calculate smart danger score
        const score = calculateDangerScore({
            email: acc.latestEmail,
            count: acc.count,
            lastActive: acc.lastActive,
            allSubjects: acc.sampleSubjects
        });

        return {
            id: key,
            name: acc.name,
            email: acc.email,
            domain: acc.domain,
            count: acc.count,
            lastActive: acc.lastActive,
            category: "Update" as const, // Would need better classification
            score,
            sampleSubjects: acc.sampleSubjects
        };
    });

    // Sort by score (highest danger first), then by count
    const sortedSenders = senders.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.count - a.count;
    });

    console.log(`[Aggregation] Processed ${emails.length} emails in ${(performance.now() - start).toFixed(2)}ms`);

    return {
        stats,
        senders: sortedSenders
    };
}
