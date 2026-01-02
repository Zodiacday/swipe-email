"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    motion,
    useMotionValue,
    useTransform,
    useAnimation,
    PanInfo,
} from "framer-motion";
import { ArrowLeft, Check, Trash2, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { NormalizedEmail } from "@/lib/types";

// --- Card Type ---
interface SwipeCard {
    id: string;
    sender: string;
    senderInitials: string;
    senderColor: string;
    subject: string;
    preview: string;
    date: string;
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

// --- Helper: Transform API email to SwipeCard ---
function transformToCard(email: NormalizedEmail): SwipeCard {
    const initials = (email.senderName || email.sender)
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const timeAgo = getTimeAgo(email.timestamp);

    return {
        id: email.id,
        sender: email.senderName || email.sender,
        senderInitials: initials || "?",
        senderColor: stringToColor(email.sender),
        subject: email.subject || "(No Subject)",
        preview: email.preview || "",
        date: timeAgo,
        originalEmail: email,
    };
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

export default function SwipePage() {
    // --- State ---
    const [cards, setCards] = useState<SwipeCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionInProgress, setActionInProgress] = useState(false);

    const { data: session, status } = useSession();
    const router = useRouter();

    // --- Motion Values (defined at top level) ---
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const cardOpacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);
    const bgOverlayOpacityTrash = useTransform(x, [-150, 0], [0.1, 0]);
    const bgOverlayOpacityKeep = useTransform(x, [0, 150], [0, 0.1]);
    const keepStampOpacity = useTransform(x, [50, 150], [0, 1]);
    const trashStampOpacity = useTransform(x, [-150, -50], [1, 0]);

    const controls = useAnimation();

    // --- Fetch Emails on Mount ---
    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/login");
            return;
        }

        const fetchEmails = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/gmail/emails?limit=50");
                if (!res.ok) throw new Error("Failed to fetch emails");
                const data = await res.json();

                if (data.emails && Array.isArray(data.emails)) {
                    const transformed = data.emails.map(transformToCard);
                    setCards(transformed);
                } else {
                    setCards([]);
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Failed to load emails. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchEmails();
    }, [session, status, router]);

    // --- Swipe Handler (using useCallback to avoid stale closures) ---
    const handleSwipe = useCallback(async (direction: "left" | "right") => {
        if (cards.length === 0 || actionInProgress) return;

        setActionInProgress(true);
        const currentCard = cards[0];

        // Animate off screen
        await controls.start({
            x: direction === "left" ? -600 : 600,
            opacity: 0,
            rotate: direction === "left" ? -30 : 30,
            transition: { duration: 0.25, ease: "easeIn" }
        });

        // Call API for action (fire and forget for speed, or await for safety)
        if (direction === "left") {
            // Trash action
            fetch("/api/gmail/emails", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "trash", emailId: currentCard.id })
            }).catch(console.error);
        }
        // Right swipe = keep (no API action needed, just remove from queue)

        // Update state
        setCards(prev => prev.slice(1));

        // Reset for next card
        x.set(0);
        controls.set({ x: 0, opacity: 1, rotate: 0 });
        setActionInProgress(false);
    }, [cards, actionInProgress, controls, x]);

    // --- Drag End Handler ---
    const onDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 100;
        if (info.offset.x < -threshold) {
            handleSwipe("left");
        } else if (info.offset.x > threshold) {
            handleSwipe("right");
        } else {
            // Snap back
            controls.start({ x: 0, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 500, damping: 30 } });
        }
    }, [handleSwipe, controls]);

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
    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Loading your inbox...</p>
            </div>
        );
    }

    // --- Error State ---
    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="text-5xl mb-2">😕</div>
                <h1 className="text-2xl font-bold text-zinc-100">Something went wrong</h1>
                <p className="text-zinc-500 max-w-md">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-3 bg-emerald-500 text-zinc-900 font-bold rounded-full flex items-center gap-2 hover:bg-emerald-400 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Try Again
                </button>
            </div>
        );
    }

    // --- Empty State ---
    if (cards.length === 0) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="text-6xl mb-6">🎉</div>
                <h1 className="text-4xl font-black text-zinc-100 mb-4 tracking-tight">You're All Caught Up!</h1>
                <p className="text-zinc-500 mb-8 max-w-md mx-auto">Inbox Zero achieved. No more emails to review.</p>
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

    return (
        <div className="min-h-screen bg-zinc-950 overflow-hidden flex flex-col relative select-none font-sans">
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

                <div className="flex items-center gap-4">
                    <span className="text-zinc-600 text-sm font-mono">{cards.length} left</span>
                    <Link href="/mode-select" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                </div>
            </header>

            {/* --- Swipe Area --- */}
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
                        <div className="p-8 flex-1 flex flex-col">
                            {/* Header */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className={`w-14 h-14 rounded-full ${activeCard.senderColor} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                                    {activeCard.senderInitials}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-zinc-100">{activeCard.sender}</h2>
                                    <p className="text-sm text-zinc-500 font-mono">{activeCard.date}</p>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="flex-1 flex flex-col justify-center mb-8">
                                <h3 className="text-3xl font-black text-white leading-tight mb-6 tracking-tight">
                                    {activeCard.subject}
                                </h3>
                                <div className="p-6 bg-zinc-800/30 rounded-2xl border border-zinc-800/50">
                                    <p className="text-zinc-400 leading-relaxed text-lg line-clamp-4">
                                        {activeCard.preview}
                                    </p>
                                </div>
                            </div>

                            {/* Footer / Hint */}
                            <div className="flex justify-between text-xs font-bold text-zinc-600 uppercase tracking-widest">
                                <span>← Swipe Left to Trash</span>
                                <span>Swipe Right to Keep →</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* --- Bottom Controls --- */}
                <div className="mt-12 flex items-center gap-8 z-30">
                    <button
                        onClick={() => handleSwipe("left")}
                        disabled={actionInProgress}
                        className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-700 hover:bg-red-500 hover:border-red-500 text-zinc-400 hover:text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 className="w-8 h-8 group-hover:animate-pulse" />
                    </button>

                    <button
                        className="w-16 h-16 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-600 hover:text-zinc-400 transition-colors"
                        title="Detail View (Coming Soon)"
                    >
                        <ArrowRight className="w-6 h-6 rotate-[-45deg]" />
                    </button>

                    <button
                        onClick={() => handleSwipe("right")}
                        disabled={actionInProgress}
                        className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-700 hover:bg-emerald-500 hover:border-emerald-500 text-zinc-400 hover:text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Check className="w-10 h-10 group-hover:animate-bounce" />
                    </button>
                </div>
            </main>
        </div>
    );
}
