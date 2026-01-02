import { NormalizedEmail } from "@/lib/types";

export interface AggregatedSender {
    id: string;      // generated from email/domain
    name: string;    // Human readable name
    email: string;   // sender email address
    domain: string;
    count: number;
    lastActive: number; // timestamp
    category: "Promotion" | "Social" | "Update" | "Personal";
    score: number;   // 0-100 nuisance score
}

export interface DashboardStats {
    totalEmails: number;
    uniqueSenders: number;
    storageEstimate: number; // in bytes (rough guess)
    oldestEmail: number;
}

export function aggregateEmails(emails: NormalizedEmail[]) {
    const start = performance.now();
    const sendersMap = new Map<string, AggregatedSender>();
    const stats: DashboardStats = {
        totalEmails: 0,
        uniqueSenders: 0,
        storageEstimate: 0,
        oldestEmail: Date.now()
    };

    emails.forEach(email => {
        // 1. Update Global Stats
        stats.totalEmails++;
        // Rough estimate: 50KB per email if body not fetched, or use payload size if available
        // For metadata only, we guess average HTML email size
        stats.storageEstimate += 50 * 1024;

        if (email.date < stats.oldestEmail) {
            stats.oldestEmail = email.date;
        }

        // 2. Aggregate by Sender
        const senderKey = email.senderEmail.toLowerCase();

        if (!sendersMap.has(senderKey)) {
            sendersMap.set(senderKey, {
                id: senderKey,
                name: email.senderName || email.senderEmail.split('@')[0],
                email: email.senderEmail,
                domain: email.senderDomain,
                count: 0,
                lastActive: 0,
                category: "Update", // default, would need better classification
                score: 0
            });
        }

        const sender = sendersMap.get(senderKey)!;
        sender.count++;
        if (email.date > sender.lastActive) {
            sender.lastActive = email.date;
        }

        // Simple scoring: High volume = higher nuisance score
        sender.score = Math.min(100, sender.count * 2);
    });

    stats.uniqueSenders = sendersMap.size;

    // Convert Map to Array and Sort by Count (Desc)
    const sortedSenders = Array.from(sendersMap.values()).sort((a, b) => b.count - a.count);

    console.log(`[Aggregation] Processed ${emails.length} emails in ${(performance.now() - start).toFixed(2)}ms`);

    return {
        stats,
        senders: sortedSenders
    };
}
