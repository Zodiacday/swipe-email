"use client";

import { useState, useCallback } from "react";
import { NormalizedEmail } from "@/lib/types";
import { updateAnalytics } from "@/lib/analytics";
import { queueAction, isOnline } from "@/lib/offlineQueue";

// --- Types ---
interface UndoAction {
    type: "trash" | "trash_sender" | "block" | "nuke";
    emailIds: string[];
    senderEmail?: string;
    domain?: string;
    filterId?: string;
    timestamp: number;
}

export interface UseEmailActionsResult {
    undoStack: UndoAction[];
    canUndo: boolean;
    trashEmail: (id: string, email: NormalizedEmail) => Promise<void>;
    trashSender: (senderEmail: string) => Promise<void>;
    trashMultipleSenders: (senderEmails: string[]) => Promise<void>;
    undoLastAction: () => Promise<boolean>;
    removeEmailFromLocal: (id: string) => void;
    blockSender: (senderEmail: string) => Promise<{ success: boolean; filterId?: string; emailsDeleted?: number }>;
    nukeDomain: (domain: string, confirm?: boolean) => Promise<{ success: boolean; requiresConfirmation?: boolean; filterId?: string; emailsDeleted?: number }>;
}

interface UseEmailActionsParams {
    emails: NormalizedEmail[];
    setEmails: React.Dispatch<React.SetStateAction<NormalizedEmail[]>>;
    refreshSilently: () => Promise<void>;
    addBlockedSender: (senderEmail: string) => void;
    removeBlockedSender: (senderEmail: string) => void;
}

/**
 * Hook for email action handlers: trash, block, nuke, undo.
 */
export function useEmailActions({
    emails,
    setEmails,
    refreshSilently,
    addBlockedSender,
    removeBlockedSender,
}: UseEmailActionsParams): UseEmailActionsResult {
    const [undoStack, setUndoStack] = useState<UndoAction[]>([]);

    // --- Trash Single Email ---
    const trashEmail = useCallback(async (id: string, email: NormalizedEmail) => {
        setUndoStack(prev => [...prev.slice(-9), { type: "trash", emailIds: [id], timestamp: Date.now() }]);
        setEmails(prev => prev.filter(e => e.id !== id));

        if (!isOnline()) {
            console.log("[useEmailActions] Offline - queueing trash action");
            await queueAction({ type: "trash", emailId: id });
            updateAnalytics("trash");
            window.dispatchEvent(new CustomEvent("analytics_updated"));
            return;
        }

        try {
            await fetch("/api/gmail/emails", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "trash", emailId: id })
            });
        } catch (err) {
            console.error("Trash failed, queueing for offline sync:", err);
            await queueAction({ type: "trash", emailId: id });
        }

        updateAnalytics("trash");
        window.dispatchEvent(new CustomEvent("analytics_updated"));
    }, [setEmails]);

    // --- Trash All From Sender ---
    const trashSender = useCallback(async (senderEmail: string) => {
        const emailsToTrash = emails.filter(e => e.sender.toLowerCase() === senderEmail.toLowerCase());
        const ids = emailsToTrash.map(e => e.id);

        if (ids.length === 0) return;

        setUndoStack(prev => [...prev.slice(-9), { type: "trash_sender", emailIds: ids, senderEmail, timestamp: Date.now() }]);
        setEmails(prev => prev.filter(e => !ids.includes(e.id)));

        try {
            await fetch("/api/gmail/action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "TRASH_SENDER", payload: { email: senderEmail } })
            });
        } catch (err) {
            console.error("Trash sender failed:", err);
            setEmails(prev => [...emailsToTrash, ...prev]);
            throw err;
        }

        updateAnalytics("trash", ids.length);
        window.dispatchEvent(new CustomEvent("analytics_updated"));
    }, [emails, setEmails]);

    // --- Trash Multiple Senders ---
    const trashMultipleSenders = useCallback(async (senderEmails: string[]) => {
        const lowerEmails = senderEmails.map(e => e.toLowerCase());
        const emailsToTrash = emails.filter(e => lowerEmails.includes(e.sender.toLowerCase()));
        const ids = emailsToTrash.map(e => e.id);

        if (ids.length === 0) return;

        setUndoStack(prev => [...prev.slice(-9), { type: "trash_sender", emailIds: ids, timestamp: Date.now() }]);
        setEmails(prev => prev.filter(e => !ids.includes(e.id)));

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
            setEmails(prev => [...emailsToTrash, ...prev]);
            throw err;
        }
    }, [emails, setEmails]);

    // --- Undo Last Action ---
    const undoLastAction = useCallback(async () => {
        if (undoStack.length === 0) return false;

        const lastAction = undoStack[undoStack.length - 1];
        setUndoStack(prev => prev.slice(0, -1));

        try {
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
                    if (lastAction.type === "block" && lastAction.senderEmail) {
                        removeBlockedSender(lastAction.senderEmail);
                    }
                    await refreshSilently();
                    return true;
                }
                return false;
            }

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

            await refreshSilently();
            return true;
        } catch (err) {
            console.error("Undo failed:", err);
            return false;
        }
    }, [undoStack, refreshSilently, removeBlockedSender]);

    // --- Block Sender ---
    const blockSender = useCallback(async (senderEmail: string) => {
        try {
            const res = await fetch("/api/gmail/block", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ senderEmail })
            });
            const data = await res.json();

            if (data.success) {
                addBlockedSender(senderEmail);
                const emailsToRemove = emails.filter(e => e.sender.toLowerCase() === senderEmail.toLowerCase());
                setEmails(prev => prev.filter(e => e.sender.toLowerCase() !== senderEmail.toLowerCase()));

                setUndoStack(prev => [...prev.slice(-9), {
                    type: "block",
                    emailIds: emailsToRemove.map(e => e.id),
                    senderEmail,
                    filterId: data.filterId,
                    timestamp: Date.now()
                }]);

                updateAnalytics("block", emailsToRemove.length);
                window.dispatchEvent(new CustomEvent("analytics_updated"));
            }
            return data;
        } catch (err) {
            console.error("Block sender failed:", err);
            return { success: false };
        }
    }, [emails, setEmails, addBlockedSender]);

    // --- Nuke Domain ---
    const nukeDomain = useCallback(async (domain: string, confirm = false) => {
        try {
            const res = await fetch("/api/gmail/nuke", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain, confirm })
            });
            const data = await res.json();

            if (data.requiresConfirmation) {
                return data;
            }

            if (data.success) {
                const emailsToRemove = emails.filter(e => e.senderDomain.toLowerCase() === domain.toLowerCase());
                setEmails(prev => prev.filter(e => e.senderDomain.toLowerCase() !== domain.toLowerCase()));

                setUndoStack(prev => [...prev.slice(-9), {
                    type: "nuke",
                    emailIds: emailsToRemove.map(e => e.id),
                    domain,
                    filterId: data.filterId,
                    timestamp: Date.now()
                }]);

                updateAnalytics("nuke", emailsToRemove.length);
                window.dispatchEvent(new CustomEvent("analytics_updated"));
            }
            return data;
        } catch (err) {
            console.error("Nuke domain failed:", err);
            return { success: false };
        }
    }, [emails, setEmails]);

    // --- Remove email locally ---
    const removeEmailFromLocal = useCallback((id: string) => {
        setEmails(prev => prev.filter(e => e.id !== id));
    }, [setEmails]);

    return {
        undoStack,
        canUndo: undoStack.length > 0,
        trashEmail,
        trashSender,
        trashMultipleSenders,
        undoLastAction,
        removeEmailFromLocal,
        blockSender,
        nukeDomain,
    };
}
