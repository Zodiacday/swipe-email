"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { NormalizedEmail } from "@/lib/types";
import { useSession } from "next-auth/react";

export interface UseEmailDataResult {
    emails: NormalizedEmail[];
    setEmails: React.Dispatch<React.SetStateAction<NormalizedEmail[]>>;
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;
    lastFetched: number | null;
    fetchEmails: () => Promise<void>;
    refreshSilently: () => Promise<void>;
}

/**
 * Hook for email data fetching and state management.
 * Handles initial fetch, silent refresh, and loading states.
 */
export function useEmailData(): UseEmailDataResult {
    const { data: session, status } = useSession();

    const [emails, setEmails] = useState<NormalizedEmail[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastFetched, setLastFetched] = useState<number | null>(null);

    const isFetchingRef = useRef(false);

    // --- Fetch Emails ---
    const fetchEmails = useCallback(async () => {
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

    // --- Silent Refresh ---
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
            // Silent fail
        } finally {
            setIsRefreshing(false);
        }
    }, [session, status]);

    // --- Auto-fetch on mount ---
    useEffect(() => {
        if (status === "authenticated" && emails.length === 0 && !isLoading) {
            fetchEmails();
        }
    }, [status, emails.length, isLoading, fetchEmails]);

    return {
        emails,
        setEmails,
        isLoading,
        isRefreshing,
        error,
        lastFetched,
        fetchEmails,
        refreshSilently,
    };
}
