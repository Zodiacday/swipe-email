/**
 * Smarter Danger Scoring Algorithm
 * 
 * Factors:
 * 1. Volume: More emails = higher danger
 * 2. Frequency decay: No interaction in 30 days = higher danger
 * 3. Subject keywords: Spam-like words boost score
 * 4. Unsubscribe presence: Has unsubscribe link = likely droppable
 * 5. Domain safety: Mass-marketing domains get boosted
 */

import { NormalizedEmail, DOMAIN_SAFETY } from "@/lib/types";

// Spam-like subject keywords that indicate promotional/droppable content
const SPAM_KEYWORDS = [
    // Urgency
    "urgent", "final notice", "act now", "limited time", "expires", "last chance",
    // Sales
    "sale", "discount", "% off", "deal", "offer", "save", "free", "promo", "coupon",
    // Engagement bait
    "don't miss", "exclusive", "special", "you won", "congratulations", "winner",
    // Pressure
    "reminder", "still interested", "following up", "checking in",
    // Newsletter
    "newsletter", "digest", "weekly", "monthly", "update",
];

// Words that indicate potentially important emails (reduce score)
const IMPORTANT_KEYWORDS = [
    "invoice", "receipt", "order confirmation", "shipping", "delivered",
    "appointment", "reservation", "booking", "ticket",
    "password", "security", "verification", "2fa", "login",
    "payment", "statement", "bank", "tax",
];

interface ScoringContext {
    email: NormalizedEmail;
    count: number;
    lastActive: number;
    allSubjects: string[];
}

/**
 * Calculate danger score for a sender aggregate
 * Returns 0-100, higher = more droppable
 */
export function calculateDangerScore(ctx: ScoringContext): number {
    let score = 0;
    const now = Date.now();

    // --- Factor 1: Volume Score (0-30 points) ---
    // More emails = higher danger, with diminishing returns
    if (ctx.count >= 100) {
        score += 30;
    } else if (ctx.count >= 50) {
        score += 25;
    } else if (ctx.count >= 20) {
        score += 20;
    } else if (ctx.count >= 10) {
        score += 15;
    } else if (ctx.count >= 5) {
        score += 10;
    } else {
        score += ctx.count * 2;
    }

    // --- Factor 2: Frequency Decay (0-20 points) ---
    // No activity in 30+ days = likely not important
    const daysSinceActive = Math.floor((now - ctx.lastActive) / (1000 * 60 * 60 * 24));
    if (daysSinceActive >= 90) {
        score += 20;
    } else if (daysSinceActive >= 60) {
        score += 15;
    } else if (daysSinceActive >= 30) {
        score += 10;
    } else if (daysSinceActive >= 14) {
        score += 5;
    }

    // --- Factor 3: Subject Keywords (±20 points) ---
    const allSubjectsLower = ctx.allSubjects.join(" ").toLowerCase();

    // Count spam keywords
    let spamKeywordCount = 0;
    for (const keyword of SPAM_KEYWORDS) {
        if (allSubjectsLower.includes(keyword)) {
            spamKeywordCount++;
        }
    }
    score += Math.min(20, spamKeywordCount * 3);

    // Count important keywords (reduce score)
    let importantKeywordCount = 0;
    for (const keyword of IMPORTANT_KEYWORDS) {
        if (allSubjectsLower.includes(keyword)) {
            importantKeywordCount++;
        }
    }
    score -= Math.min(15, importantKeywordCount * 5);

    // --- Factor 4: Unsubscribe Link Presence (0-10 points) ---
    // If the email has an unsubscribe link, it's likely a marketing email
    const hasUnsubscribe = ctx.email.listUnsubscribe?.http || ctx.email.listUnsubscribe?.mailto;
    if (hasUnsubscribe) {
        score += 10;
    }

    // --- Factor 5: Domain Safety Multiplier ---
    const domain = ctx.email.senderDomain.toLowerCase();

    // Boost for known mass-marketing platforms
    if (DOMAIN_SAFETY.safeToNuke.some(d => domain.includes(d))) {
        score *= 1.3;
    }

    // Drastically reduce for "Never Nuke" domains
    if (DOMAIN_SAFETY.neverNuke.some(d => domain.includes(d))) {
        score *= 0.2;
    } else if (DOMAIN_SAFETY.caution.some(d => domain.includes(d))) {
        score *= 0.6;
    }

    // --- Factor 6: Category Hints ---
    // Promotions and social updates are more droppable
    if (ctx.email.category === "promo" || ctx.email.category === "social" || ctx.email.category === "newsletter") {
        score += 5;
    }

    // Clamp to 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get danger level label based on score
 */
export function getDangerLevel(score: number): "low" | "medium" | "high" | "danger" {
    if (score >= 70) return "danger";
    if (score >= 50) return "high";
    if (score >= 30) return "medium";
    return "low";
}

/**
 * Get danger color class based on score
 */
export function getDangerColor(score: number): string {
    if (score >= 70) return "text-red-500";
    if (score >= 50) return "text-orange-400";
    if (score >= 30) return "text-amber-400";
    return "text-zinc-400";
}

/**
 * Get danger badge style based on score
 */
export function getDangerBadge(score: number): { bg: string; text: string; label: string } {
    if (score >= 70) {
        return { bg: "bg-red-500/20", text: "text-red-400", label: "DANGER" };
    }
    if (score >= 50) {
        return { bg: "bg-orange-500/20", text: "text-orange-400", label: "HIGH" };
    }
    if (score >= 30) {
        return { bg: "bg-amber-500/20", text: "text-amber-400", label: "MEDIUM" };
    }
    return { bg: "bg-zinc-500/20", text: "text-zinc-400", label: "LOW" };
}
