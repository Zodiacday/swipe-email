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
import { ArrowLeft, Check, Trash2, Clock, Loader2, RefreshCw, Flame, Zap, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEmailContext } from "@/contexts/EmailContext";
import { useToast } from "@/contexts/ToastContext";
import { setLastMode } from "@/lib/userPreferences";
import { NormalizedEmail } from "@/lib/types";
import { SkeletonCard } from "@/components/Skeleton";

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
    const { data: session, status } = useSession();
    const router = useRouter();

    // --- Local State ---
    const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());
    const [actionInProgress, setActionInProgress] = useState(false);
    const [sessionStats, setSessionStats] = useState({ reviewed: 0, trashed: 0, kept: 0 });
    const [initialCount, setInitialCount] = useState(0);
    const [streak, setStreak] = useState(0);
    const [lastActionTime, setLastActionTime] = useState<number | null>(null);
    const [celebration, setCelebration] = useState<string | null>(null);
    const [bulkPrompt, setBulkPrompt] = useState<{ sender: string, count: number, email: string } | null>(null);

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
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const cardOpacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);
    const bgOverlayOpacityTrash = useTransform(x, [-150, 0], [0.1, 0]);
    const bgOverlayOpacityKeep = useTransform(x, [0, 150], [0, 0.1]);
    const keepStampOpacity = useTransform(x, [50, 150], [0, 1]);
    const trashStampOpacity = useTransform(x, [-150, -50], [1, 0]);

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

        // Animate off screen
        await controls.start({
            x: direction === "left" ? -600 : 600,
            opacity: 0,
            rotate: direction === "left" ? -30 : 30,
            transition: { duration: 0.25, ease: "easeIn" }
        });

        // Mark as processed locally
        setProcessedIds(prev => new Set([...prev, currentCard.id]));

        // Update streak
        const now = Date.now();
        if (lastActionTime && now - lastActionTime < 4000) {
            setStreak(s => s + 1);
        } else {
            setStreak(1);
        }
        setLastActionTime(now);

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

                if (remainingFromSender >= 3) {
                    setBulkPrompt({
                        sender: currentCard.sender,
                        count: remainingFromSender,
                        email: currentCard.originalEmail.sender
                    });
                } else {
                    showToast("Trashed ✓", {
                        type: "success",
                        undoAction: async () => {
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

        // Reset for next card
        x.set(0);
        controls.set({ x: 0, opacity: 1, rotate: 0 });
        setActionInProgress(false);
    }, [cards, actionInProgress, controls, x, trashEmail, showToast, undoLastAction, lastActionTime, sessionStats.reviewed, initialCount]);

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

    // --- Drag End ---
    const onDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 100;
        if (info.offset.x < -threshold) {
            handleSwipe("left");
        } else if (info.offset.x > threshold) {
            handleSwipe("right");
        } else {
            controls.start({ x: 0, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 500, damping: 30 } });
        }
    }, [handleSwipe, controls]);

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
                <h1 className="text-2xl font-bold text-zinc-100">Something went wrong</h1>
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

    // --- Empty State (All Done) ---
    if (cards.length === 0) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="text-6xl mb-6">🎉</div>
                <h1 className="text-4xl font-black text-zinc-100 mb-4 tracking-tight">All Done!</h1>
                {initialCount > 0 && sessionStats.reviewed >= initialCount && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mb-6 inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900 px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest animate-float"
                    >
                        <Star className="w-4 h-4 fill-zinc-900" />
                        Perfect Session
                        <Star className="w-4 h-4 fill-zinc-900" />
                    </motion.div>
                )}
                <p className="text-zinc-500 mb-8 max-w-md mx-auto">
                    You reviewed <span className="text-zinc-100 font-bold">{sessionStats.reviewed}</span> emails this session.
                </p>

                {/* Session Stats */}
                <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
                    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                        <div className="text-2xl font-bold text-red-400">{sessionStats.trashed}</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider">Trashed</div>
                    </div>
                    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                        <div className="text-2xl font-bold text-emerald-400">{sessionStats.kept}</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider">Kept</div>
                    </div>
                    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                        <div className="text-2xl font-bold text-zinc-300">{sessionStats.reviewed}</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider">Total</div>
                    </div>
                </div>

                <p className="text-xs text-zinc-600 mb-8">
                    Gmail keeps trashed emails for 30 days. Nothing is permanently deleted.
                </p>

                <div className="flex gap-4">
                    <Link href="/dashboard" className="px-8 py-3 bg-cyan-500 text-zinc-900 font-bold rounded-full hover:bg-cyan-400 transition-colors">
                        Go to Dashboard
                    </Link>
                    <Link href="/mode-select" className="px-8 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-full hover:bg-zinc-700 transition-colors">
                        Back to Menu
                    </Link>
                </div>
            </div>
        );
    }

    const activeCard = cards[0];
    const nextCard = cards[1];

    // Calculate sender count
    const senderCount = emails.filter(e => e.sender.toLowerCase() === activeCard.originalEmail.sender.toLowerCase()).length;

    return (
        <div className="min-h-screen bg-zinc-950 overflow-hidden flex flex-col relative select-none font-sans touch-none">
            {/* Background Tint Overlays */}
            <motion.div style={{ opacity: bgOverlayOpacityTrash }} className="absolute inset-0 bg-red-500 pointer-events-none z-0" />
            <motion.div style={{ opacity: bgOverlayOpacityKeep }} className="absolute inset-0 bg-emerald-500 pointer-events-none z-0" />

            {/* --- Top Bar --- */}
            <header className="h-16 px-6 bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800/50 flex items-center justify-between sticky top-0 z-50">
                {/* Mode Toggle */}
                <div className="flex items-center gap-1 bg-zinc-800 rounded-full p-1 relative">
                    <div className="relative z-10 px-6 py-1.5 rounded-full text-sm font-medium text-zinc-900 bg-emerald-500 shadow-sm">
                        Swipe
                    </div>
                    <Link href="/dashboard" className="relative z-10 px-6 py-1.5 rounded-full text-sm font-medium text-zinc-400 hover:text-zinc-300 transition-colors">
                        Dashboard
                    </Link>
                </div>

                {/* Progress Counter + Streak */}
                <div className="flex items-center gap-4">
                    {/* Streak Indicator */}
                    {streak >= 3 && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/30 rounded-full px-3 py-1"
                        >
                            <Flame className="w-4 h-4 text-orange-400" />
                            <span className="text-orange-400 font-bold text-sm">{streak}x</span>
                        </motion.div>
                    )}
                    <div className="flex items-center gap-2 text-sm font-mono">
                        <span className="text-emerald-400 font-bold">{sessionStats.reviewed}</span>
                        <span className="text-zinc-600">/</span>
                        <span className="text-zinc-400">{initialCount || emails.length}</span>
                        <span className="text-zinc-600 text-xs">reviewed</span>
                    </div>
                    {isRefreshing && <RefreshCw className="w-4 h-4 text-zinc-600 animate-spin" />}
                    <Link href="/mode-select" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                </div>
            </header>

            {/* Celebration Overlay */}
            <AnimatePresence>
                {celebration && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none"
                    >
                        <div className="bg-zinc-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl px-8 py-6 shadow-2xl">
                            <p className="text-3xl font-black text-white">{celebration}</p>
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
                            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <Trash2 className="w-8 h-8 text-red-400" />
                            </div>
                            <h2 className="text-xl font-bold text-center mb-2">Trash them all?</h2>
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
                                    className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-2xl transition-colors"
                                >
                                    NO, JUST THIS ONE
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Swipe Area --- --- */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 relative w-full max-w-lg mx-auto">
                <div className="relative w-full aspect-[3/4] max-h-[600px]">

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
                        style={{ x, rotate, opacity: cardOpacity }}
                        animate={controls}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.7}
                        onDragEnd={onDragEnd}
                        className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl z-20 flex flex-col cursor-grab active:cursor-grabbing transform-gpu"
                    >
                        {/* Drag Indicators (Stamps) */}
                        <motion.div style={{ opacity: keepStampOpacity }} className="absolute top-8 left-8 border-4 border-emerald-500 text-emerald-500 rounded-xl px-4 py-2 text-4xl font-black uppercase tracking-widest -rotate-12 z-50 bg-zinc-900/80 backdrop-blur-sm">
                            KEEP
                        </motion.div>
                        <motion.div style={{ opacity: trashStampOpacity }} className="absolute top-8 right-8 border-4 border-red-500 text-red-500 rounded-xl px-4 py-2 text-4xl font-black uppercase tracking-widest rotate-12 z-50 bg-zinc-900/80 backdrop-blur-sm">
                            TRASH
                        </motion.div>

                        {/* Card Content */}
                        <div className="p-10 flex-1 flex flex-col">
                            {/* Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-14 h-14 rounded-full ${activeCard.senderColor} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                                    {activeCard.senderInitials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-lg font-bold text-zinc-100 truncate">{activeCard.sender}</h2>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-zinc-500 font-mono">{activeCard.date}</p>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${activeCard.category === "promo" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                            activeCard.category === "social" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                activeCard.category === "newsletter" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                                    "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                                            }`}>
                                            {activeCard.category}
                                        </span>
                                    </div>
                                    {senderCount > 1 && (
                                        <p className="text-xs text-cyan-500 mt-1">
                                            +{senderCount - 1} more from this sender
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Body */}
                            <div className="flex-1 flex flex-col justify-center mb-6">
                                <h3 className="text-2xl font-black text-white leading-tight mb-6 tracking-tight">
                                    {activeCard.subject}
                                </h3>
                                <div className="p-6 bg-zinc-800/30 rounded-2xl border border-zinc-800/50">
                                    <p className="text-zinc-400 leading-relaxed text-base line-clamp-4">
                                        {activeCard.preview}
                                    </p>
                                </div>
                            </div>

                            {/* Footer / Hint */}
                            <div className="flex justify-between text-xs font-bold text-zinc-600 uppercase tracking-widest">
                                <span>← Trash</span>
                                <span>Keep →</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* --- Bottom Controls --- */}
                <div className="mt-16 flex items-center gap-8 z-30">
                    <button
                        onClick={() => handleSwipe("left")}
                        disabled={actionInProgress}
                        className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-700 hover:bg-red-500 hover:border-red-500 text-zinc-400 hover:text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 className="w-8 h-8" />
                    </button>

                    <button
                        onClick={handleSkip}
                        disabled={actionInProgress}
                        className="w-16 h-16 rounded-full bg-zinc-900/50 border border-zinc-800 flex flex-col items-center justify-center text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 transition-all hover:scale-105 active:scale-95"
                        title="Skip for later"
                    >
                        <Clock className="w-5 h-5" />
                        <span className="text-[8px] uppercase mt-0.5">Later</span>
                    </button>

                    <button
                        onClick={() => handleSwipe("right")}
                        disabled={actionInProgress}
                        className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-700 hover:bg-emerald-500 hover:border-emerald-500 text-zinc-400 hover:text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Check className="w-10 h-10" />
                    </button>
                </div>
            </main>
        </div>
    );
}
