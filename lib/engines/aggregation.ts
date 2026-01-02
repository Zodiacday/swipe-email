import { NormalizedEmail, DOMAIN_SAFETY } from "@/lib/types";

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

        if (email.timestamp < stats.oldestEmail) {
            stats.oldestEmail = email.timestamp;
        }

        // 2. Aggregate by Sender
        const senderKey = email.sender.toLowerCase();

        if (!sendersMap.has(senderKey)) {
            sendersMap.set(senderKey, {
                id: senderKey,
                name: email.senderName || email.sender.split('@')[0],
                email: email.sender,
                domain: email.senderDomain,
                count: 0,
                lastActive: 0,
                category: "Update", // default, would need better classification
                score: 0,
                sampleSubjects: []
            });
        }

        const sender = sendersMap.get(senderKey)!;
        sender.count++;
        if (email.timestamp > sender.lastActive) {
            sender.lastActive = email.timestamp;
        }

        // Collect up to 5 sample subjects
        if (sender.sampleSubjects.length < 5 && email.subject) {
            sender.sampleSubjects.push(email.subject);
        }

        // SMART SCORING v2: Incorporate domain safety
        const domain = email.senderDomain.toLowerCase();
        let nuisanceBonus = 0;

        // Boost score for known mass-marketing platforms
        if (DOMAIN_SAFETY.safeToNuke.some(d => domain.includes(d))) {
            nuisanceBonus = 20;
        }

        // Drastically reduce score for "Never Nuke" domains
        let multiplier = 1.0;
        if (DOMAIN_SAFETY.neverNuke.some(d => domain.includes(d))) {
            multiplier = 0.2; // 80% discount
        } else if (DOMAIN_SAFETY.caution.some(d => domain.includes(d))) {
            multiplier = 0.7; // 30% discount
        }

        sender.score = Math.min(100, (sender.count * 2 + nuisanceBonus) * multiplier);
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

