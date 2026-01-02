"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from "react";
import { NormalizedEmail } from "@/lib/types";
import { AggregatedSender, DashboardStats, aggregateEmails } from "@/lib/engines/aggregation";
import { useSession } from "next-auth/react";

// --- Types ---
interface UndoAction {
    type: "trash" | "trash_sender";
    emailIds: string[];
    senderEmail?: string;
    timestamp: number;
}

interface EmailContextType {
    // Data
    emails: NormalizedEmail[];
    aggregates: {
        senders: AggregatedSender[];
        stats: DashboardStats;
    };

    // State
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;
    lastFetched: number | null;

    // Undo
    undoStack: UndoAction[];
    canUndo: boolean;

    // Actions
    fetchEmails: () => Promise<void>;
    refreshSilently: () => Promise<void>;
    trashEmail: (id: string, email: NormalizedEmail) => Promise<void>;
    trashSender: (senderEmail: string) => Promise<void>;
    trashMultipleSenders: (senderEmails: string[]) => Promise<void>;
    undoLastAction: () => Promise<boolean>;
    removeEmailFromLocal: (id: string) => void;
    blockSender: (senderEmail: string) => Promise<void>;
    markPersonal: (senderEmail: string) => void;
    personalSenders: Set<string>;
    blockedSenders: Set<string>;
}

const EmailContext = createContext<EmailContextType | null>(null);

// --- Provider ---
export function EmailProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();

    // Core State
    const [emails, setEmails] = useState<NormalizedEmail[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastFetched, setLastFetched] = useState<number | null>(null);
    const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
    const [personalSenders, setPersonalSenders] = useState<Set<string>>(new Set());
    const [blockedSenders, setBlockedSenders] = useState<Set<string>>(new Set());

    // Derived: Aggregates (recomputed when emails change)
    const aggregates = useMemo(() => {
        if (emails.length === 0) {
            return {
                senders: [],
                stats: { totalEmails: 0, uniqueSenders: 0, storageEstimate: 0, oldestEmail: Date.now() }
            };
        }
        // Filter out blocked senders before aggregating
        const visibleEmails = emails.filter(e => !blockedSenders.has(e.sender.toLowerCase()));
        const agg = aggregateEmails(visibleEmails);

        // Apply personal label
        agg.senders.forEach(s => {
            if (personalSenders.has(s.email.toLowerCase())) {
                s.category = "Personal";
                s.score = 0; // Personal senders have 0 nuisance score
            }
        });

        return agg;
    }, [emails, personalSenders, blockedSenders]);

    // --- Fetch Emails ---
    const fetchEmails = useCallback(async () => {
        if (status !== "authenticated" || !session) return;

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/gmail/emails?limit=100");
            if (!res.ok) throw new Error("Failed to fetch emails");

            const data = await res.json();
            if (data.emails && Array.isArray(data.emails)) {
                setEmails(data.emails);
                setLastFetched(Date.now());
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to load emails. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [session, status]);

    // --- Silent Refresh (doesn't show loading) ---
    const refreshSilently = useCallback(async () => {
        if (status !== "authenticated" || !session) return;

        setIsRefreshing(true);

        try {
            const res = await fetch("/api/gmail/emails?limit=100");
            if (!res.ok) throw new Error("Failed to refresh");

            const data = await res.json();
            if (data.emails && Array.isArray(data.emails)) {
                setEmails(data.emails);
                setLastFetched(Date.now());
            }
        } catch (err) {
            console.error("Refresh error:", err);
            // Silent fail - don't show error
        } finally {
            setIsRefreshing(false);
        }
    }, [session, status]);

    // --- Auto-fetch on mount if data is stale ---
    useEffect(() => {
        if (status === "authenticated" && emails.length === 0 && !isLoading) {
            fetchEmails();
        }
    }, [status, emails.length, isLoading, fetchEmails]);

    // --- Trash Single Email ---
    const trashEmail = useCallback(async (id: string, email: NormalizedEmail) => {
        // Add to undo stack
        setUndoStack(prev => [...prev.slice(-9), { type: "trash", emailIds: [id], timestamp: Date.now() }]);

        // Optimistic: Remove from local state
        setEmails(prev => prev.filter(e => e.id !== id));

        // Fire API (don't await for speed)
        try {
            await fetch("/api/gmail/emails", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "trash", emailId: id })
            });
        } catch (err) {
            console.error("Trash failed:", err);
            // Revert on failure
            setEmails(prev => [email, ...prev]);
            throw err;
        }
    }, []);

    // --- Trash All From Sender ---
    const trashSender = useCallback(async (senderEmail: string) => {
        const emailsToTrash = emails.filter(e => e.sender.toLowerCase() === senderEmail.toLowerCase());
        const ids = emailsToTrash.map(e => e.id);

        if (ids.length === 0) return;

        // Add to undo stack
        setUndoStack(prev => [...prev.slice(-9), { type: "trash_sender", emailIds: ids, senderEmail, timestamp: Date.now() }]);

        // Optimistic: Remove from local state
        setEmails(prev => prev.filter(e => !ids.includes(e.id)));

        // Fire API
        try {
            await fetch("/api/gmail/action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "TRASH_SENDER", payload: { email: senderEmail } })
            });
        } catch (err) {
            console.error("Trash sender failed:", err);
            // Revert on failure
            setEmails(prev => [...emailsToTrash, ...prev]);
            throw err;
        }
    }, [emails]);

    // --- Trash Multiple Senders ---
    const trashMultipleSenders = useCallback(async (senderEmails: string[]) => {
        const lowerEmails = senderEmails.map(e => e.toLowerCase());
        const emailsToTrash = emails.filter(e => lowerEmails.includes(e.sender.toLowerCase()));
        const ids = emailsToTrash.map(e => e.id);

        if (ids.length === 0) return;

        // Add to undo stack as a SINGLE action
        setUndoStack(prev => [...prev.slice(-9), {
            type: "trash_sender",
            emailIds: ids,
            timestamp: Date.now()
        }]);

        // Optimistic: Remove from local state
        setEmails(prev => prev.filter(e => !ids.includes(e.id)));

        // Fire API calls in parallel
        try {
            await Promise.all(senderEmails.map(senderEmail =>
                fetch("/api/gmail/action", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "TRASH_SENDER", payload: { email: senderEmail } })
                })
            ));
        } catch (err) {
            console.error("Bulk trash senders failed:", err);
            // Revert
            setEmails(prev => [...emailsToTrash, ...prev]);
            throw err;
        }
    }, [emails]);

    // --- Undo Last Action ---
    const undoLastAction = useCallback(async () => {
        if (undoStack.length === 0) return false;

        const lastAction = undoStack[undoStack.length - 1];
        setUndoStack(prev => prev.slice(0, -1));

        try {
            // Process in batches of 20 to avoid rate limits
            const batchSize = 20;
            for (let i = 0; i < lastAction.emailIds.length; i += batchSize) {
                const chunk = lastAction.emailIds.slice(i, i + batchSize);
                await Promise.all(
                    chunk.map(id =>
                        fetch("/api/gmail/emails", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "untrash", emailId: id })
                        })
                    )
                );
            }

            // Refresh to get accurate state
            await refreshSilently();
            return true;
        } catch (err) {
            console.error("Undo failed:", err);
            return false;
        }
    }, [undoStack, refreshSilently]);

    // --- Mark Personal ---
    const markPersonal = useCallback((senderEmail: string) => {
        setPersonalSenders(prev => new Set([...prev, senderEmail.toLowerCase()]));
    }, []);

    // --- Block Sender ---
    const blockSender = useCallback(async (senderEmail: string) => {
        setBlockedSenders(prev => new Set([...prev, senderEmail.toLowerCase()]));
        // Also trash their current emails
        await trashSender(senderEmail);
    }, [trashSender]);

    // --- Remove email locally ---
    const removeEmailFromLocal = useCallback((id: string) => {
        setEmails(prev => prev.filter(e => e.id !== id));
    }, []);

    // --- Context Value ---
    const value: EmailContextType = {
        emails,
        aggregates,
        isLoading,
        isRefreshing,
        error,
        lastFetched,
        undoStack,
        canUndo: undoStack.length > 0,
        fetchEmails,
        refreshSilently,
        trashEmail,
        trashSender,
        trashMultipleSenders,
        undoLastAction,
        removeEmailFromLocal,
        blockSender,
        markPersonal,
        personalSenders,
        blockedSenders,
    };

    return <EmailContext.Provider value={value}>{children}</EmailContext.Provider>;
}

// --- Hook ---
export function useEmailContext() {
    const context = useContext(EmailContext);
    if (!context) {
        throw new Error("useEmailContext must be used within EmailProvider");
    }
    return context;
}
