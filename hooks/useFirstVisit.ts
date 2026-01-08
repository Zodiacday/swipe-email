"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect first-time visits for a specific feature.
 * Uses localStorage to persist state across sessions.
 * 
 * @param key - Unique identifier for the feature (e.g., "swipe_tutorial")
 * @returns { isFirstVisit, dismiss } - State and function to dismiss
 */
export function useFirstVisit(key: string) {
    const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);

    useEffect(() => {
        const hasVisited = localStorage.getItem(`swipe_first_visit_${key}`);
        setIsFirstVisit(!hasVisited);
    }, [key]);

    const dismiss = () => {
        localStorage.setItem(`swipe_first_visit_${key}`, "1");
        setIsFirstVisit(false);
    };

    return {
        isFirstVisit: isFirstVisit === true,
        isLoading: isFirstVisit === null,
        dismiss
    };
}
