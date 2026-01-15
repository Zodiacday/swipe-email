"use client";

import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { NormalizedEmail } from "@/lib/types";
import { AggregatedSender, DashboardStats, aggregateEmails } from "@/lib/engines/aggregation";
import { useEmailData } from "@/hooks/useEmailData";
import { useEmailActions } from "@/hooks/useEmailActions";
import { useSenderManagement } from "@/hooks/useSenderManagement";
import { updateAnalytics } from "@/lib/analytics";

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
    unsubscribeSender: (email: NormalizedEmail) => Promise<{ success: boolean; method?: string; error?: string }>;
    markPersonal: (senderEmail: string) => void;
    personalSenders: Set<string>;
    blockedSenders: Set<string>;
}

const EmailContext = createContext<EmailContextType | null>(null);

// --- Provider ---
export function EmailProvider({ children }: { children: ReactNode }) {
    // Compose hooks
    const emailData = useEmailData();
    const senderManagement = useSenderManagement();
    const emailActions = useEmailActions({
        emails: emailData.emails,
        setEmails: emailData.setEmails,
        refreshSilently: emailData.refreshSilently,
        addBlockedSender: senderManagement.addBlockedSender,
        removeBlockedSender: senderManagement.removeBlockedSender,
    });

    // Track last known aggregates to prevent flicker during refresh
    const lastAggregatesRef = React.useRef<{
        senders: AggregatedSender[];
        stats: DashboardStats;
    } | null>(null);

    // Derived: Aggregates (recomputed when emails change)
    // IMPORTANT: Preserves previous values during refresh to prevent UI flicker
    const aggregates = useMemo(() => {
        // During refresh (isRefreshing=true but emails still exist), don't reset
        // Only show empty state on true initial load (no previous data)
        if (emailData.emails.length === 0) {
            // Return last known values if available (prevents flicker)
            if (lastAggregatesRef.current && emailData.isRefreshing) {
                return lastAggregatesRef.current;
            }
            return {
                senders: [],
                stats: { totalEmails: 0, uniqueSenders: 0, storageEstimate: 0, oldestEmail: Date.now() }
            };
        }

        // Filter out blocked senders before aggregating
        const visibleEmails = emailData.emails.filter(
            e => !senderManagement.blockedSenders.has(e.sender.toLowerCase())
        );
        const agg = aggregateEmails(visibleEmails);

        // Apply personal label
        agg.senders.forEach(s => {
            if (senderManagement.personalSenders.has(s.email.toLowerCase())) {
                s.category = "Personal";
                s.score = 0;
            }
        });

        // Cache for next refresh
        lastAggregatesRef.current = agg;

        return agg;
    }, [emailData.emails, emailData.isRefreshing, senderManagement.personalSenders, senderManagement.blockedSenders]);

    // Wrap markPersonal to also update analytics
    const markPersonal = (senderEmail: string) => {
        senderManagement.markPersonal(senderEmail);
        updateAnalytics("keep");
        window.dispatchEvent(new CustomEvent("analytics_updated"));
    };

    // --- Context Value ---
    const value: EmailContextType = {
        emails: emailData.emails,
        aggregates,
        isLoading: emailData.isLoading,
        isRefreshing: emailData.isRefreshing,
        error: emailData.error,
        lastFetched: emailData.lastFetched,
        undoStack: emailActions.undoStack,
        canUndo: emailActions.canUndo,
        fetchEmails: emailData.fetchEmails,
        refreshSilently: emailData.refreshSilently,
        trashEmail: emailActions.trashEmail,
        trashSender: emailActions.trashSender,
        trashMultipleSenders: emailActions.trashMultipleSenders,
        undoLastAction: emailActions.undoLastAction,
        removeEmailFromLocal: emailActions.removeEmailFromLocal,
        blockSender: emailActions.blockSender,
        nukeDomain: emailActions.nukeDomain,
        unsubscribeSender: emailActions.unsubscribeSender,
        markPersonal,
        personalSenders: senderManagement.personalSenders,
        blockedSenders: senderManagement.blockedSenders,
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
