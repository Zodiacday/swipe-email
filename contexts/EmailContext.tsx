"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode, useRef } from "react";
import { NormalizedEmail } from "@/lib/types";
import { AggregatedSender, DashboardStats, aggregateEmails } from "@/lib/engines/aggregation";
import { useSession } from "next-auth/react";

// --- Types ---
interface UndoAction {
    type: "trash" | "trash_sender" | "block" | "nuke";
    emailIds: string[];
    senderEmail?: string;
    domain?: string;
    filterId?: string;
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
    blockSender: (senderEmail: string) => Promise<{ success: boolean; filterId?: string; emailsDeleted?: number }>;
    nukeDomain: (domain: string, confirm?: boolean) => Promise<{ success: boolean; requiresConfirmation?: boolean; filterId?: string; emailsDeleted?: number }>;
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

    // Ref to prevent duplicate fetch calls
    const isFetchingRef = useRef(false);
    const isInitializedRef = useRef(false);

    // --- Load from localStorage on mount ---
    useEffect(() => {
        if (isInitializedRef.current) return;
        isInitializedRef.current = true;

        try {
            const savedBlocked = localStorage.getItem("swipe_blocked_senders");
            const savedPersonal = localStorage.getItem("swipe_personal_senders");

            if (savedBlocked) {
                setBlockedSenders(new Set(JSON.parse(savedBlocked)));
            }
            if (savedPersonal) {
                setPersonalSenders(new Set(JSON.parse(savedPersonal)));
            }
        } catch (err) {
            console.warn("Failed to load saved senders:", err);
        }
    }, []);

    // --- Persist blockedSenders to localStorage ---
    useEffect(() => {
        if (!isInitializedRef.current) return;
        try {
            localStorage.setItem("swipe_blocked_senders", JSON.stringify([...blockedSenders]));
        } catch (err) {
            console.warn("Failed to save blocked senders:", err);
        }
    }, [blockedSenders]);

    // --- Persist personalSenders to localStorage ---
    useEffect(() => {
        if (!isInitializedRef.current) return;
        try {
            localStorage.setItem("swipe_personal_senders", JSON.stringify([...personalSenders]));
        } catch (err) {
            console.warn("Failed to save personal senders:", err);
        }
    }, [personalSenders]);

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
        // Prevent duplicate calls
        if (isFetchingRef.current) return;
        if (status !== "authenticated" || !session) return;

        isFetchingRef.current = true;
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
            isFetchingRef.current = false;
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
            // For block/nuke: Call undo API to delete the filter
            if ((lastAction.type === "block" || lastAction.type === "nuke") && lastAction.filterId) {
                const res = await fetch("/api/gmail/undo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: lastAction.type,
                        filterId: lastAction.filterId,
                        emailIds: lastAction.emailIds
                    })
                });
                const data = await res.json();

                if (data.success) {
                    // Remove from blocked senders set
                    if (lastAction.type === "block" && lastAction.senderEmail) {
                        setBlockedSenders(prev => {
                            const next = new Set(prev);
                            next.delete(lastAction.senderEmail!.toLowerCase());
                            return next;
                        });
                    }
                    await refreshSilently();
                    return true;
                }
                return false;
            }

            // For trash actions: Untrash emails in batches
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

    // --- Block Sender (Real API call with filter creation) ---
    const blockSender = useCallback(async (senderEmail: string): Promise<{ success: boolean; filterId?: string; emailsDeleted?: number }> => {
        try {
            const res = await fetch("/api/gmail/block", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ senderEmail })
            });
            const data = await res.json();

            if (data.success) {
                // Update local state
                setBlockedSenders(prev => new Set([...prev, senderEmail.toLowerCase()]));

                // Remove emails from local state
                const emailsToRemove = emails.filter(e => e.sender.toLowerCase() === senderEmail.toLowerCase());
                setEmails(prev => prev.filter(e => e.sender.toLowerCase() !== senderEmail.toLowerCase()));

                // Add to undo stack with filterId
                setUndoStack(prev => [...prev.slice(-9), {
                    type: "block",
                    emailIds: emailsToRemove.map(e => e.id),
                    senderEmail,
                    filterId: data.filterId,
                    timestamp: Date.now()
                }]);
            }
            return data;
        } catch (err) {
            console.error("Block sender failed:", err);
            return { success: false };
        }
    }, [emails]);

    // --- Nuke Domain (Real API call with filter creation) ---
    const nukeDomain = useCallback(async (domain: string, confirm = false): Promise<{ success: boolean; requiresConfirmation?: boolean; filterId?: string; emailsDeleted?: number }> => {
        try {
            const res = await fetch("/api/gmail/nuke", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain, confirm })
            });
            const data = await res.json();

            // If requires confirmation, return early
            if (data.requiresConfirmation) {
                return data;
            }

            if (data.success) {
                // Remove all emails from this domain locally
                const emailsToRemove = emails.filter(e => e.senderDomain.toLowerCase() === domain.toLowerCase());
                setEmails(prev => prev.filter(e => e.senderDomain.toLowerCase() !== domain.toLowerCase()));

                // Add to undo stack with filterId
                setUndoStack(prev => [...prev.slice(-9), {
                    type: "nuke",
                    emailIds: emailsToRemove.map(e => e.id),
                    domain,
                    filterId: data.filterId,
                    timestamp: Date.now()
                }]);
            }
            return data;
        } catch (err) {
            console.error("Nuke domain failed:", err);
            return { success: false };
        }
    }, [emails]);

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
        nukeDomain,
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
