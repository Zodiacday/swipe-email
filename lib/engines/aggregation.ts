import { NormalizedEmail, DOMAIN_SAFETY } from "@/lib/types";
import { calculateDangerScore } from "@/lib/dangerScore";
import { detectNewsletter } from "@/lib/detection/newsletter";

export interface AggregatedSender {
    id: string;      // generated from email/domain
    name: string;    // Human readable name
    email: string;   // sender email address
    domain: string;
    count: number;
    lastActive: number; // timestamp
    category: "Promotion" | "Social" | "Newsletter" | "Update" | "Personal";
    score: number;   // 0-100 nuisance score
    sampleSubjects: string[]; // Up to 5 sample subjects for preview
    hasUnsubscribe: boolean; // Whether sender has unsubscribe link
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
    // Track categories across all emails from this sender
    categoryVotes: {
        promo: number;
        social: number;
        newsletter: number;
        personal: number;
        update: number;
    };
    hasUnsubscribe: boolean;
}

/**
 * Map detection categories to display categories
 */
function mapCategory(detectionCategory: string): AggregatedSender["category"] {
    switch (detectionCategory) {
        case "promo":
            return "Promotion";
        case "social":
            return "Social";
        case "newsletter":
            return "Newsletter";
        case "personal":
            return "Personal";
        default:
            return "Update";
    }
}

/**
 * Get the winning category from votes
 */
function getWinningCategory(votes: SenderAccumulator["categoryVotes"]): AggregatedSender["category"] {
    const entries = Object.entries(votes) as [string, number][];
    entries.sort((a, b) => b[1] - a[1]);

    if (entries[0][1] === 0) return "Update";
    return mapCategory(entries[0][0]);
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
                latestEmail: email,
                categoryVotes: { promo: 0, social: 0, newsletter: 0, personal: 0, update: 0 },
                hasUnsubscribe: false
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

        // 3. Detect category using newsletter engine
        const detection = detectNewsletter(email);
        if (detection.type === "promo") sender.categoryVotes.promo++;
        else if (detection.type === "social") sender.categoryVotes.social++;
        else if (detection.type === "newsletter") sender.categoryVotes.newsletter++;
        else if (detection.type === "personal") sender.categoryVotes.personal++;
        else sender.categoryVotes.update++;

        // Track if sender has unsubscribe capability
        if (email.listUnsubscribe?.http || email.listUnsubscribe?.mailto) {
            sender.hasUnsubscribe = true;
        }
    });

    stats.uniqueSenders = sendersMap.size;

    // Convert to AggregatedSender with smart scoring and real categories
    const senders: AggregatedSender[] = Array.from(sendersMap.entries()).map(([key, acc]) => {
        // Calculate smart danger score
        const score = calculateDangerScore({
            email: acc.latestEmail,
            count: acc.count,
            lastActive: acc.lastActive,
            allSubjects: acc.sampleSubjects
        });

        // Determine category by voting across all emails from this sender
        const category = getWinningCategory(acc.categoryVotes);

        return {
            id: key,
            name: acc.name,
            email: acc.email,
            domain: acc.domain,
            count: acc.count,
            lastActive: acc.lastActive,
            category,
            score,
            sampleSubjects: acc.sampleSubjects,
            hasUnsubscribe: acc.hasUnsubscribe
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
