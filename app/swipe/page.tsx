"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Zap, LayoutDashboard, Trash2, Check, RefreshCw, ArrowLeft } from "lucide-react";
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
import { SkeletonCard } from "@/components/Skeleton";
import { PaywallModal } from "@/components/Paywall";
import { SwipeCard } from "@/components/SwipeCard/SwipeCard";
import { MagneticButton } from "@/components/ui/magnetic-button";

export default function SwipePage() {
    // --- Context ---
    const { emails, isLoading, error, fetchEmails, trashEmail, trashSender, canUndo, undoLastAction } = useEmailContext();
    const { showToast } = useToast();
    const { play: playSound } = useSoundEffects();
    const { isFirstVisit, dismiss: dismissTutorial } = useFirstVisit("swipe_tutorial");
    const { isFirstVisit: showOnboarding, dismiss: dismissOnboarding } = useFirstVisit("onboarding_concepts");
    const { status } = useSession();
    const router = useRouter();

    // --- Local State ---
    const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());
    const [sessionStats, setSessionStats] = useState({ reviewed: 0, trashed: 0, kept: 0 });
    const [initialCount, setInitialCount] = useState(0);
    const [celebration, setCelebration] = useState<string | null>(null);
    const [showStats, setShowStats] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // --- Derived: Emails to show (filter out processed) ---
    const remainingEmails = useMemo(() => {
        return emails.filter(e => !processedIds.has(e.id));
    }, [emails, processedIds]);

    // Set initial count on first load
    useEffect(() => {
        if (emails.length > 0 && initialCount === 0) {
            setInitialCount(emails.length);
        }
    }, [emails.length, initialCount]);

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
        if (remainingEmails.length === 0) return;

        const currentEmail = remainingEmails[0];
        playSound("whoosh");

        // Mark as processed
        setProcessedIds(prev => new Set([...prev, currentEmail.id]));

        // Update stats
        const newReviewed = sessionStats.reviewed + 1;

        if (direction === "left") {
            // LEFT = TRASH
            setSessionStats(s => ({ ...s, reviewed: s.reviewed + 1, trashed: s.trashed + 1 }));

            try {
                await trashEmail(currentEmail.id, currentEmail);

                // Check for more from same sender
                const remainingFromSender = remainingEmails.filter(e =>
                    e.id !== currentEmail.id &&
                    e.sender.toLowerCase() === currentEmail.sender.toLowerCase()
                ).length;

                if (remainingFromSender >= 3) {
                    showToast(`Trashed ✓`, {
                        type: "success",
                        duration: 6000,
                        action: {
                            label: `Nuke ${remainingFromSender} more`,
                            onClick: async () => {
                                await trashSender(currentEmail.sender);
                                const senderEmails = emails.filter(e =>
                                    e.sender.toLowerCase() === currentEmail.sender.toLowerCase()
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
                                    next.delete(currentEmail.id);
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
            // RIGHT = KEEP
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
    }, [remainingEmails, emails, sessionStats.reviewed, initialCount, trashEmail, trashSender, undoLastAction, showToast, playSound]);

    // --- Keyboard Shortcuts ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") handleSwipe("left");
            if (e.key === "ArrowRight" || e.key === " ") handleSwipe("right");
            if (e.key === "Escape") router.push("/mode-select");
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleSwipe, router]);

    // --- Loading State ---
    if (status === "loading" || (isLoading && emails.length === 0)) {
        return (
            <div className="min-h-screen bg-zinc-950 overflow-hidden flex flex-col font-sans">
                <header className="h-16 px-6 bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800/50 flex items-center justify-between">
                    <div className="w-48 h-8 bg-zinc-800 rounded-full animate-pulse" />
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-4 bg-zinc-800 rounded animate-pulse" />
                        <div className="w-6 h-6 bg-zinc-800 rounded animate-pulse" />
                    </div>
                </header>
                <main className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-lg mx-auto">
                    <SkeletonCard />
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

    // --- Empty State ---
    if (remainingEmails.length === 0) {
        return <InboxZero stats={sessionStats} onRefresh={fetchEmails} />;
    }

    const currentEmail = remainingEmails[0];

    return (
        <div className="min-h-screen bg-black overflow-hidden flex flex-col relative select-none font-sans">
            {/* Top Spacer for Navbar */}
            <div className="h-20" />

            {/* --- Header Bar --- */}
            <header className="px-4 sm:px-6 py-3 flex items-center justify-between relative z-50">
                {/* Progress */}
                <div className="flex items-center gap-3">
                    <div className="text-[10px] sm:text-xs font-black tracking-widest text-zinc-500 uppercase">
                        {remainingEmails.length} left
                    </div>
                    <div className="w-16 sm:w-24 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div
                            animate={{ width: `${((initialCount - remainingEmails.length) / (initialCount || 1)) * 100}%` }}
                            className="h-full bg-emerald-500"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <AnimatePresence>
                        {showStats && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-3 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl"
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
                        className={`p-2.5 rounded-xl border transition-all ${showStats ? 'bg-emerald-500 border-emerald-400 text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                    >
                        <Zap className="w-4 h-4" />
                    </button>
                    {canUndo && (
                        <button
                            onClick={undoLastAction}
                            className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-200 font-bold rounded-xl text-sm flex items-center gap-1.5"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            Undo
                        </button>
                    )}
                    <Link
                        href="/mode-select"
                        className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                    </Link>
                </div>
            </header>

            {/* Tutorial Overlays */}
            <SwipeTutorial isOpen={isFirstVisit} onDismiss={dismissTutorial} />
            <OnboardingSlides isOpen={showOnboarding && !isFirstVisit} onDismiss={dismissOnboarding} />

            {/* Celebration Overlay */}
            <AnimatePresence>
                {celebration && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none"
                    >
                        <div className="bg-zinc-900 border border-emerald-500/30 rounded-3xl px-8 py-6 shadow-2xl">
                            <p className="text-3xl font-black text-white tracking-tight">{celebration}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Swipe Area --- */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-4">
                {/* Card Container - Responsive sizing */}
                <div className="relative w-full max-w-sm sm:max-w-md h-[65vh] sm:h-[70vh] max-h-[600px] min-h-[400px]">
                    {/* Background stack cards */}
                    {remainingEmails.length > 1 && (
                        <div className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-3xl transform scale-95 translate-y-3 opacity-30 z-0" />
                    )}
                    {remainingEmails.length > 2 && (
                        <div className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-3xl transform scale-90 translate-y-6 opacity-15 z-0" />
                    )}

                    {/* Active SwipeCard */}
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={currentEmail.id}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="absolute inset-0 z-10"
                        >
                            <SwipeCard
                                email={currentEmail}
                                onSwipe={handleSwipe}
                                isActive={true}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Bottom Controls */}
                <div className="mt-4 sm:mt-6 flex items-center justify-center gap-4 sm:gap-6">
                    <MagneticButton
                        onClick={() => handleSwipe("left")}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-900 border border-zinc-700 hover:bg-red-500 hover:border-red-500 text-zinc-400 hover:text-white flex items-center justify-center shadow-lg transition-all"
                        title="Trash"
                    >
                        <Trash2 className="w-6 h-6 sm:w-7 sm:h-7" />
                    </MagneticButton>

                    <MagneticButton
                        onClick={() => handleSwipe("right")}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-900 border border-zinc-700 hover:bg-emerald-500 hover:border-emerald-500 text-zinc-400 hover:text-white flex items-center justify-center shadow-lg transition-all"
                        title="Keep"
                    >
                        <Check className="w-7 h-7 sm:w-8 sm:h-8" />
                    </MagneticButton>
                </div>
            </main>

            {/* Paywall modal */}
            <PaywallModal
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)}
                onUpgrade={() => {
                    setShowPaywall(false);
                    showToast("Coming soon! Pro subscriptions launching next week.");
                }}
            />
        </div>
    );
}
