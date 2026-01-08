"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    motion,
    useMotionValue,
    useTransform,
    useAnimation,
    PanInfo,
    AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import { Zap, LayoutDashboard, ArrowRight, Trash2, Mail, RefreshCw, Star, ShieldOff, Check, ArrowLeft, ArrowUp, ArrowDown, Clock, BellOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEmailContext } from "@/contexts/EmailContext";
import { useToast } from "@/contexts/ToastContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useFirstVisit } from "@/hooks/useFirstVisit";
import { SwipeTutorial } from "@/components/SwipeTutorial";
import { InboxZero } from "@/components/InboxZero";
import { OnboardingSlides } from "@/components/OnboardingSlides";
import { setLastMode } from "@/lib/userPreferences";
import { NormalizedEmail } from "@/lib/types";
import { SkeletonCard } from "@/components/Skeleton";
import { PaywallModal } from "@/components/Paywall";
import { useFreemium } from "@/hooks/useFreemium";

// --- Card Type ---
interface SwipeCard {
    id: string;
    sender: string;
    senderInitials: string;
    senderColor: string;
    subject: string;
    preview: string;
    date: string;
    category: string;
    originalEmail: NormalizedEmail;
}

// --- Helper: Generate avatar color from string ---
function stringToColor(str: string): string {
    const colors = [
        "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500",
        "bg-lime-500", "bg-green-500", "bg-emerald-500", "bg-teal-500",
        "bg-cyan-500", "bg-sky-500", "bg-blue-500", "bg-indigo-500",
        "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500"
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function getTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

// --- Transform email to card ---
function transformToCard(email: NormalizedEmail): SwipeCard {
    const initials = (email.senderName || email.sender)
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return {
        id: email.id,
        sender: email.senderName || email.sender,
        senderInitials: initials || "?",
        senderColor: stringToColor(email.sender),
        subject: email.subject || "(No Subject)",
        preview: email.preview || "",
        date: getTimeAgo(email.timestamp),
        category: email.category,
        originalEmail: email,
    };
}

export default function SwipePage() {
    // --- Context ---
    const { emails, isLoading, error, fetchEmails, trashEmail, trashSender, canUndo, undoLastAction, isRefreshing } = useEmailContext();
    const { showToast } = useToast();
    const { play: playSound } = useSoundEffects();
    const { isFirstVisit, dismiss: dismissTutorial } = useFirstVisit("swipe_tutorial");
    const { isFirstVisit: showOnboarding, dismiss: dismissOnboarding } = useFirstVisit("onboarding_concepts");
    const { data: session, status } = useSession();
    const router = useRouter();
    const { canSwipe: canSwipeMore, remaining: swipesRemaining, doSwipe, tier } = useFreemium();

    // --- Local State ---
    const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());
    const [actionInProgress, setActionInProgress] = useState(false);
    const [sessionStats, setSessionStats] = useState({ reviewed: 0, trashed: 0, kept: 0 });
    const [initialCount, setInitialCount] = useState(0);
    const [streak, setStreak] = useState(0);
    const [lastActionTime, setLastActionTime] = useState<number | null>(null);
    const [celebration, setCelebration] = useState<string | null>(null);
    const [bulkPrompt, setBulkPrompt] = useState<{ sender: string, count: number, email: string } | null>(null);
    const [hasSwipedOnce, setHasSwipedOnce] = useState(false);
    const [showStats, setShowStats] = useState(false); // Hide stats by default (Zen)
    const [showPaywall, setShowPaywall] = useState(false);


    // --- Derived: Cards to show (filter out processed) ---
    const cards = useMemo(() => {
        const filtered = emails.filter(e => !processedIds.has(e.id));
        return filtered.map(transformToCard);
    }, [emails, processedIds]);

    // Set initial count on first load
    useEffect(() => {
        if (emails.length > 0 && initialCount === 0) {
            setInitialCount(emails.length);
        }
    }, [emails.length, initialCount]);

    // --- Motion Values ---
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const cardOpacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);
    // Card scale: slight lift when dragging
    const cardScale = useTransform(
        x,
        [-150, -50, 0, 50, 150],
        [1.02, 1.01, 1, 1.01, 1.02]
    );
    const bgOverlayOpacityTrash = useTransform(x, [-150, 0], [0.15, 0]);
    const bgOverlayOpacityKeep = useTransform(x, [0, 150], [0, 0.15]);
    const bgOverlayOpacityUnsub = useTransform(y, [-150, 0], [0.15, 0]);
    const bgOverlayOpacitySkip = useTransform(y, [0, 150], [0, 0.15]);
    const keepStampOpacity = useTransform(x, [50, 150], [0, 1]);
    const trashStampOpacity = useTransform(x, [-150, -50], [1, 0]);
    const unsubStampOpacity = useTransform(y, [-150, -50], [1, 0]);
    const skipStampOpacity = useTransform(y, [50, 150], [0, 1]);


    const controls = useAnimation();

    // Track mode for preferences
    useEffect(() => {
        setLastMode("swipe");
    }, []);

    // Redirect if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // --- Swipe Handler ---
    const handleSwipe = useCallback(async (direction: "left" | "right") => {
        if (cards.length === 0 || actionInProgress) return;

        setActionInProgress(true);
        const currentCard = cards[0];

        // Haptic feedback
        if (typeof window !== "undefined" && window.navigator.vibrate) {
            window.navigator.vibrate(20);
        }

        // Play sound
        playSound("whoosh");

        // Animate off screen with spring physics
        await controls.start({
            x: direction === "left" ? -600 : 600,
            opacity: 0,
            rotate: direction === "left" ? -30 : 30,
            scale: 0.9,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 25,
                mass: 1.5 // Heavier, more premium feel
            }
        });

        // Mark as processed locally
        setProcessedIds(prev => new Set([...prev, currentCard.id]));

        // RESET position immediately so the next card appears centered
        // We do this BEFORE the potentially slow API call
        x.set(0);
        controls.set({ x: 0, opacity: 1, rotate: 0 });

        // Update streak
        const now = Date.now();
        if (lastActionTime && now - lastActionTime < 4000) {
            setStreak(s => s + 1);
        } else {
            setStreak(1);
        }
        setLastActionTime(now);
        setHasSwipedOnce(true);

        // Update stats
        const newReviewed = sessionStats.reviewed + 1;
        if (direction === "left") {
            setSessionStats(s => ({ ...s, reviewed: s.reviewed + 1, trashed: s.trashed + 1 }));

            // Trash via context
            try {
                await trashEmail(currentCard.id, currentCard.originalEmail);

                // Smart Prompt: If there are many more from this sender, ask to trash all
                const remainingFromSender = emails.filter(e =>
                    !processedIds.has(e.id) &&
                    e.id !== currentCard.id &&
                    e.sender.toLowerCase() === currentCard.originalEmail.sender.toLowerCase()
                ).length;

                // Show toast with one-tap nuke action if there are more from this sender
                if (remainingFromSender >= 3) {
                    showToast(`Trashed ✓`, {
                        type: "success",
                        duration: 6000,
                        action: {
                            label: `Nuke ${remainingFromSender} more`,
                            onClick: async () => {
                                await trashSender(currentCard.originalEmail.sender);
                                // Mark all from this sender as processed
                                const senderEmails = emails.filter(e =>
                                    e.sender.toLowerCase() === currentCard.originalEmail.sender.toLowerCase()
                                );
                                setProcessedIds(prev => {
                                    const next = new Set(prev);
                                    senderEmails.forEach(e => next.add(e.id));
                                    return next;
                                });
                                playSound("success");
                                showToast(`Nuked ${remainingFromSender} emails!`, { type: "success" });
                            }
                        }
                    });
                } else {
                    showToast("Trashed ✓", {
                        type: "success",
                        undoAction: async () => {
                            playSound("undo");
                            const success = await undoLastAction();
                            if (success) {
                                setProcessedIds(prev => {
                                    const next = new Set(prev);
                                    next.delete(currentCard.id);
                                    return next;
                                });
                                showToast("Restored ✓", { type: "info" });
                            }
                        }
                    });
                }
            } catch {
                showToast("Failed to trash", { type: "error" });
            }
        } else {
            setSessionStats(s => ({ ...s, reviewed: s.reviewed + 1, kept: s.kept + 1 }));
            showToast("Kept ✓", { type: "info" });
        }

        // Celebration milestones
        if (newReviewed === 10) {
            setCelebration("🚀 Great start!");
            setTimeout(() => setCelebration(null), 2000);
        } else if (newReviewed === 25) {
            setCelebration("🔥 25 done!");
            setTimeout(() => setCelebration(null), 2000);
        } else if (initialCount > 0 && newReviewed === Math.floor(initialCount / 2)) {
            setCelebration("💪 Halfway there!");
            setTimeout(() => setCelebration(null), 2000);
        }

        // Only release lock if we're NOT showing a bulk prompt
        const isShowingPrompt = (direction === "left" && emails.filter(e =>
            !processedIds.has(e.id) &&
            e.id !== currentCard.id &&
            e.sender.toLowerCase() === currentCard.originalEmail.sender.toLowerCase()
        ).length >= 3);

        if (!isShowingPrompt) {
            setActionInProgress(false);
        }
    }, [cards, actionInProgress, controls, x, trashEmail, showToast, undoLastAction, lastActionTime, sessionStats.reviewed, initialCount, emails, processedIds]);

    // --- Skip Handler ---
    const handleSkip = useCallback(async () => {
        if (cards.length === 0 || actionInProgress) return;

        setActionInProgress(true);
        const currentCard = cards[0];

        // Animate down
        await controls.start({
            y: 400,
            opacity: 0,
            transition: { duration: 0.2 }
        });

        // Move to end by marking processed then unprocessed
        // Actually, for skip we just move past it temporarily
        setProcessedIds(prev => new Set([...prev, currentCard.id]));
        showToast("Skipped for later", { type: "info" });

        // Reset
        x.set(0);
        controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
        setActionInProgress(false);
    }, [cards, actionInProgress, controls, x, showToast]);

    // --- Bulk Trash Handler ---
    const handleBulkTrash = async () => {
        if (!bulkPrompt) return;
        const { email, count, sender } = bulkPrompt;
        setBulkPrompt(null);
        setActionInProgress(true);

        try {
            await trashSender(email);
            // Mark all from this sender as processed
            const fromSenderIds = emails
                .filter(e => e.sender.toLowerCase() === email.toLowerCase())
                .map(e => e.id);

            setProcessedIds(prev => {
                const next = new Set(prev);
                fromSenderIds.forEach(id => next.add(id));
                return next;
            });

            setSessionStats(s => ({
                ...s,
                reviewed: s.reviewed + count,
                trashed: s.trashed + count
            }));

            showToast(`Cleared ${count + 1} emails from ${sender} ✓`, { type: "success" });
        } catch (err) {
            console.error("Bulk trash failed:", err);
            showToast("Bulk action failed", { type: "error" });
        } finally {
            setActionInProgress(false);
        }
    };

    // --- Unsubscribe Handler ---
    const handleUnsubscribe = useCallback(async () => {
        if (cards.length === 0 || actionInProgress) return;

        setActionInProgress(true);
        const currentCard = cards[0];

        // Animate up
        await controls.start({
            y: -600,
            opacity: 0,
            transition: { duration: 0.25, ease: "easeIn" }
        });

        // Mark as processed
        setProcessedIds(prev => new Set([...prev, currentCard.id]));

        // Try HTTP unsubscribe via API first
        const unsubLink = currentCard.originalEmail.listUnsubscribe?.http;

        try {
            const res = await fetch("/api/gmail/unsubscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: currentCard.originalEmail })
            });
            const data = await res.json();

            if (data.success) {
                showToast(`Unsubscribed (${data.method}) ✓`, { type: "success" });
            } else if (data.requiresConfirmation) {
                // Link looks suspicious - fall back to opening manually
                if (unsubLink) {
                    window.open(unsubLink, "_blank");
                    showToast("Opened unsubscribe page (verify manually)", { type: "info" });
                } else {
                    showToast("Could not unsubscribe - no link found", { type: "error" });
                }
            } else {
                // API failed - fall back to opening link
                if (unsubLink) {
                    window.open(unsubLink, "_blank");
                    showToast("Opened unsubscribe page ✓", { type: "success" });
                } else {
                    showToast("No unsubscribe link found - email skipped", { type: "info" });
                }
            }
        } catch {
            // Network error - fall back to opening link
            if (unsubLink) {
                window.open(unsubLink, "_blank");
                showToast("Opened unsubscribe page ✓", { type: "success" });
            } else {
                showToast("No unsubscribe link found - email skipped", { type: "info" });
            }
        }

        // Reset position
        x.set(0);
        y.set(0);
        controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
        setActionInProgress(false);
    }, [cards, actionInProgress, controls, x, y, showToast]);

    // --- Drag End (4-way) ---
    const onDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 80;
        const absX = Math.abs(info.offset.x);
        const absY = Math.abs(info.offset.y);

        // Determine primary direction
        if (absX > absY) {
            // Horizontal swipe
            if (info.offset.x < -threshold) {
                handleSwipe("left");
            } else if (info.offset.x > threshold) {
                handleSwipe("right");
            } else {
                controls.start({ x: 0, y: 0, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 500, damping: 30 } });
            }
        } else {
            // Vertical swipe
            if (info.offset.y < -threshold) {
                handleUnsubscribe();
            } else if (info.offset.y > threshold) {
                handleSkip();
            } else {
                controls.start({ x: 0, y: 0, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 500, damping: 30 } });
            }
        }
    }, [handleSwipe, handleUnsubscribe, handleSkip, controls]);

    // --- Keyboard Shortcuts ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") handleSwipe("left");
            if (e.key === "ArrowRight" || e.key === " ") handleSwipe("right");
            if (e.key === "ArrowDown") handleSkip();
            if (e.key === "Escape") router.push("/mode-select");
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleSwipe, handleSkip, router]);

    // --- Loading State (Skeleton) ---
    if (status === "loading" || (isLoading && emails.length === 0)) {
        return (
            <div className="min-h-screen bg-zinc-950 overflow-hidden flex flex-col font-sans">
                {/* Skeleton Header */}
                <header className="h-16 px-6 bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800/50 flex items-center justify-between">
                    <div className="w-48 h-8 bg-zinc-800 rounded-full animate-pulse" />
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-4 bg-zinc-800 rounded animate-pulse" />
                        <div className="w-6 h-6 bg-zinc-800 rounded animate-pulse" />
                    </div>
                </header>

                {/* Skeleton Card Area */}
                <main className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-lg mx-auto">
                    <SkeletonCard />

                    {/* Skeleton Controls */}
                    <div className="mt-16 flex items-center gap-8">
                        <div className="w-20 h-20 bg-zinc-800 rounded-full animate-pulse" />
                        <div className="w-16 h-16 bg-zinc-800 rounded-full animate-pulse" />
                        <div className="w-20 h-20 bg-zinc-800 rounded-full animate-pulse" />
                    </div>
                </main>
            </div>
        );
    }

    // --- Error State ---
    if (error && emails.length === 0) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="text-5xl mb-2">😕</div>
                <h1 className="text-2xl font-black tracking-tight text-zinc-100">Something went wrong</h1>
                <p className="text-zinc-500 max-w-md">{error}</p>
                <button
                    onClick={() => fetchEmails()}
                    className="mt-4 px-6 py-3 bg-emerald-500 text-zinc-900 font-bold rounded-full flex items-center gap-2 hover:bg-emerald-400 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Try Again
                </button>
            </div>
        );
    }

    // --- Empty State (All Done or Inbox Zero) ---
    if (cards.length === 0) {
        return <InboxZero stats={sessionStats} onRefresh={fetchEmails} />;
    }

    const activeCard = cards[0];
    const nextCard = cards[1];

    // Calculate sender count
    const senderCount = emails.filter(e => e.sender.toLowerCase() === activeCard.originalEmail.sender.toLowerCase()).length;

    return (
        <div className="min-h-screen bg-black overflow-hidden flex flex-col relative select-none font-sans touch-none">
            {/* Background Tint Overlays (4-way) */}
            <motion.div style={{ opacity: bgOverlayOpacityTrash }} className="absolute inset-0 bg-red-500/20 pointer-events-none z-0" />
            <motion.div style={{ opacity: bgOverlayOpacityKeep }} className="absolute inset-0 bg-emerald-500/20 pointer-events-none z-0" />
            <motion.div style={{ opacity: bgOverlayOpacityUnsub }} className="absolute inset-0 bg-amber-500/20 pointer-events-none z-0" />
            <motion.div style={{ opacity: bgOverlayOpacitySkip }} className="absolute inset-0 bg-zinc-800/20 pointer-events-none z-0" />

            {/* --- Zen Top Bar --- */}
            <div className="h-20" /> {/* Spacer for Navbar */}
            <header className="px-6 py-4 flex items-center justify-end relative z-50">
                <div className="flex items-center gap-2">
                    <AnimatePresence>
                        {showStats && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-4 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-2xl mr-2"
                            >
                                <div className="text-center">
                                    <div className="text-sm font-black text-rose-500 leading-none">{sessionStats.trashed}</div>
                                    <div className="text-[8px] font-bold text-zinc-600">NUKED</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm font-black text-emerald-500 leading-none">{sessionStats.kept}</div>
                                    <div className="text-[8px] font-bold text-zinc-600">KEPT</div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className={`p-3 rounded-2xl border transition-all ${showStats ? 'bg-emerald-500 border-emerald-400 text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                        title="Toggle Stats"
                    >
                        <Zap className="w-5 h-5" />
                    </button>
                    {canUndo && (
                        <button
                            onClick={undoLastAction}
                            className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-200 font-bold rounded-2xl hover:border-emerald-500/50 transition-all flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Undo
                        </button>
                    )}
                    <Link
                        href="/mode-select"
                        className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                        title="Exit to Mode Select"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                    </Link>
                </div>
            </header>

            {/* Floating Emails Remaining HUD (Left) */}
            <div className="fixed left-6 top-1/2 -translate-y-1/2 z-[100] hidden lg:flex flex-col items-center gap-4">
                <div className="h-32 w-[2px] bg-zinc-800 rounded-full relative overflow-hidden">
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(cards.length / (initialCount || 1)) * 100}%` }}
                        className="absolute bottom-0 left-0 right-0 bg-emerald-500"
                    />
                </div>
                <div className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-black tracking-[0.3em] text-zinc-600 uppercase">
                    {cards.length} Remaining
                </div>
            </div>

            {/* Mobile Counter Bar (Top) */}
            <div className="lg:hidden absolute top-[80px] left-0 right-0 z-40 px-6">
                <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                    <span>Inbox Queue</span>
                    <span className="text-emerald-500">{cards.length} Left</span>
                </div>
                <div className="mt-2 h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div
                        animate={{ width: `${(cards.length / (initialCount || 1)) * 100}%` }}
                        className="h-full bg-emerald-500"
                    />
                </div>
            </div>


            {/* Celebration Overlay */}
            {/* Tutorial Overlay */}
            <SwipeTutorial isOpen={isFirstVisit} onDismiss={dismissTutorial} />
            <OnboardingSlides isOpen={showOnboarding && !isFirstVisit} onDismiss={dismissOnboarding} />

            <AnimatePresence>
                {celebration && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none"
                    >
                        <div className="glass rounded-3xl px-8 py-6 shadow-2xl border-emerald-500/30">
                            <p className="text-3xl font-black text-white tracking-tight">{celebration}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bulk Action Prompt */}
            <AnimatePresence>
                {bulkPrompt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="glass rounded-3xl p-8 max-w-sm w-full shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <Trash2 className="w-8 h-8 text-red-400" />
                            </div>
                            <h2 className="text-xl font-black tracking-tight text-center mb-2">Trash them all?</h2>
                            <p className="text-zinc-400 text-center mb-8">
                                There are <span className="text-white font-bold">{bulkPrompt.count}</span> more emails from <span className="text-white font-bold">{bulkPrompt.sender}</span>. Want to trash all of them at once?
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleBulkTrash}
                                    className="w-full py-4 bg-red-500 hover:bg-red-400 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <Zap className="w-5 h-5" />
                                    YES, NUKE ALL {bulkPrompt.count + 1}
                                </button>
                                <button
                                    onClick={() => {
                                        setBulkPrompt(null);
                                        showToast("Trashed single email ✓", { type: "success" });
                                    }}
                                    className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-3xl transition-colors"
                                >
                                    NO, JUST THIS ONE
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Swipe Area --- */}
            <main className="flex-1 flex flex-col items-center justify-start pt-8 pb-0 relative w-full max-w-md mx-auto">
                <div className="relative w-full aspect-[4/6] max-h-[550px]">

                    {/* Background Stack Layer 2 */}
                    <div className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-3xl transform scale-90 translate-y-8 opacity-20 z-0" />

                    {/* Background Stack Layer 1 */}
                    {nextCard && (
                        <div className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-3xl transform scale-95 translate-y-4 opacity-40 z-10 p-8 flex flex-col justify-between">
                            <div className="flex items-center gap-4 opacity-50">
                                <div className="w-12 h-12 rounded-full bg-zinc-800" />
                                <div className="space-y-2">
                                    <div className="w-32 h-4 bg-zinc-800 rounded" />
                                    <div className="w-24 h-3 bg-zinc-800 rounded" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active Card */}
                    <motion.div
                        key={activeCard.id}
                        style={{ x, y, rotate, opacity: cardOpacity, scale: cardScale }}
                        animate={controls}
                        drag
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        dragElastic={0.7}
                        onDragEnd={onDragEnd}
                        whileDrag={{
                            boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
                            cursor: "grabbing"
                        }}
                        className="absolute inset-0 bg-zinc-950 border border-emerald-500/30 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] z-20 flex flex-col cursor-grab transform-gpu overflow-hidden"
                    >

                        {/* Drag Indicators (4-way Stamps) - Sharpened */}
                        <motion.div style={{ opacity: keepStampOpacity }} className="absolute top-8 left-8 border border-emerald-500 text-emerald-500 rounded-md px-3 py-1 text-2xl font-black uppercase tracking-widest -rotate-12 z-50 bg-black/90 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                            KEEP
                        </motion.div>
                        <motion.div style={{ opacity: trashStampOpacity }} className="absolute top-8 right-8 border border-red-500 text-red-500 rounded-md px-3 py-1 text-2xl font-black uppercase tracking-widest rotate-12 z-50 bg-black/90 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                            TRASH
                        </motion.div>
                        <motion.div style={{ opacity: unsubStampOpacity }} className="absolute top-8 left-1/2 -translate-x-1/2 border border-amber-500 text-amber-500 rounded-md px-3 py-1 text-2xl font-black uppercase tracking-widest z-50 bg-black/90 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                            UNSUB
                        </motion.div>
                        <motion.div style={{ opacity: skipStampOpacity }} className="absolute bottom-8 left-1/2 -translate-x-1/2 border border-zinc-500 text-zinc-500 rounded-md px-3 py-1 text-2xl font-black uppercase tracking-widest z-50 bg-black/90 shadow-[0_0_15px_rgba(161,161,170,0.3)]">
                            SKIP
                        </motion.div>

                        {/* Card Content area */}
                        <div className="p-8 flex-1 flex flex-col overflow-hidden bg-zinc-950">
                            <div className="flex items-center gap-4 mb-8">
                                <div className={`w-14 h-14 rounded-2xl ${activeCard.senderColor} flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0 border border-white/10`}>
                                    {activeCard.senderInitials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-black tracking-tighter text-white truncate uppercase italic leading-none">{activeCard.sender}</h2>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <p className="text-[10px] text-zinc-600 font-mono font-bold tracking-widest uppercase">{activeCard.date}</p>
                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-md border ${activeCard.category === "promo" ? "bg-orange-500/5 text-orange-400 border-orange-500/20" :
                                            activeCard.category === "social" ? "bg-blue-500/5 text-blue-400 border-blue-500/20" :
                                                activeCard.category === "newsletter" ? "bg-purple-500/5 text-purple-400 border-purple-500/20" :
                                                    "bg-zinc-800 text-zinc-500 border-zinc-700/50"
                                            }`}>
                                            {activeCard.category}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col justify-center relative">
                                <h3 className="text-3xl font-black tracking-tight text-white mb-6 line-clamp-2 leading-[1.1]">
                                    {activeCard.subject}
                                </h3>
                                <div className="p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl">
                                    <p className="text-zinc-400 text-lg leading-relaxed editorial-type line-clamp-4">
                                        {activeCard.preview}
                                    </p>
                                </div>
                            </div>

                            {/* Mobile Swipe Hints - Editorial Style */}
                            <div className="mt-8 pt-8 border-t border-zinc-900 grid grid-cols-3 text-[9px] font-black tracking-[0.3em] text-zinc-700 uppercase text-center">
                                <div className="flex flex-col items-center gap-1">
                                    <ArrowLeft size={10} />
                                    <span>TRASH</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex gap-2">
                                        <ArrowUp size={10} />
                                        <ArrowDown size={10} />
                                    </div>
                                    <span>UNSUB/SKIP</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <ArrowRight size={10} />
                                    <span>KEEP</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* --- Bottom Controls (Sticky, 4-way) --- */}
                <div className="sticky bottom-0 left-0 right-0 py-8 flex items-center justify-center gap-4 z-30 w-full">
                    <button
                        onClick={() => handleSwipe("left")}
                        disabled={actionInProgress}
                        className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700 hover:bg-red-500 hover:border-red-500 text-zinc-400 hover:text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                        title="Trash"
                    >
                        <Trash2 className="w-6 h-6" />
                    </button>

                    <button
                        onClick={handleUnsubscribe}
                        disabled={actionInProgress}
                        className="w-12 h-12 rounded-full bg-zinc-900/50 border border-zinc-800 hover:bg-amber-500 hover:border-amber-500 text-zinc-500 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                        title="Unsubscribe"
                    >
                        <BellOff className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleSkip}
                        disabled={actionInProgress}
                        className="w-12 h-12 rounded-full bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-600 hover:border-zinc-600 text-zinc-500 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                        title="Skip for later"
                    >
                        <Clock className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => handleSwipe("right")}
                        disabled={actionInProgress}
                        className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700 hover:bg-emerald-500 hover:border-emerald-500 text-zinc-400 hover:text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                        title="Keep"
                    >
                        <Check className="w-7 h-7" />
                    </button>
                </div>
            </main>

            {/* Freemium usage bar */}


            {/* Paywall modal */}
            <PaywallModal
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)}
                onUpgrade={() => {
                    // TODO: Integrate with payment provider
                    setShowPaywall(false);
                    showToast("Coming soon! Pro subscriptions launching next week.");
                }}
            />
        </div>
    );
}
