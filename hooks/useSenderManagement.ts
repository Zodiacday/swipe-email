"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export interface UseSenderManagementResult {
    personalSenders: Set<string>;
    blockedSenders: Set<string>;
    markPersonal: (senderEmail: string) => void;
    addBlockedSender: (senderEmail: string) => void;
    removeBlockedSender: (senderEmail: string) => void;
}

/**
 * Hook for managing personal and blocked sender lists with localStorage persistence.
 */
export function useSenderManagement(): UseSenderManagementResult {
    const [personalSenders, setPersonalSenders] = useState<Set<string>>(new Set());
    const [blockedSenders, setBlockedSenders] = useState<Set<string>>(new Set());
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

    // --- Persist blockedSenders ---
    useEffect(() => {
        if (!isInitializedRef.current) return;
        try {
            localStorage.setItem("swipe_blocked_senders", JSON.stringify([...blockedSenders]));
        } catch (err) {
            console.warn("Failed to save blocked senders:", err);
        }
    }, [blockedSenders]);

    // --- Persist personalSenders ---
    useEffect(() => {
        if (!isInitializedRef.current) return;
        try {
            localStorage.setItem("swipe_personal_senders", JSON.stringify([...personalSenders]));
        } catch (err) {
            console.warn("Failed to save personal senders:", err);
        }
    }, [personalSenders]);

    // --- Mark as Personal ---
    const markPersonal = useCallback((senderEmail: string) => {
        setPersonalSenders(prev => new Set([...prev, senderEmail.toLowerCase()]));
    }, []);

    // --- Add Blocked Sender ---
    const addBlockedSender = useCallback((senderEmail: string) => {
        setBlockedSenders(prev => new Set([...prev, senderEmail.toLowerCase()]));
    }, []);

    // --- Remove Blocked Sender ---
    const removeBlockedSender = useCallback((senderEmail: string) => {
        setBlockedSenders(prev => {
            const next = new Set(prev);
            next.delete(senderEmail.toLowerCase());
            return next;
        });
    }, []);

    return {
        personalSenders,
        blockedSenders,
        markPersonal,
        addBlockedSender,
        removeBlockedSender,
    };
}
