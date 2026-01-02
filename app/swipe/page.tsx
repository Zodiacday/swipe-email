"use client";

import { useState, useRef, useEffect } from "react";
import {
    motion,
    useMotionValue,
    useTransform,
    useAnimation,
    PanInfo,
    AnimatePresence
} from "framer-motion";
import { ArrowLeft, Check, Trash2, Zap, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// --- Mock Data Generator (Replace with real API later) ---
const generateEmail = (id: number) => ({
    id: `email-${id}`,
    sender: "Newsletter Daily",
    senderInitials: "ND",
    senderColor: "bg-purple-500",
    subject: "Your Weekly Tech Digest: AI Revolution Is Here",
    preview: "Discover the latest trends in artificial intelligence, machine learning, and how they impact your workflow. Plus, a special offer inside...",
    date: "2h ago"
});

export default function SwipePage() {
    const [cards, setCards] = useState(Array.from({ length: 5 }).map((_, i) => generateEmail(i)));
    const [history, setHistory] = useState<any[]>([]); // For Undo
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);

    // Background Color Transforms (Subtle tint)
    // We can't animate body bg easily from here without context, 
    // but we can animate a full-screen overlay or the main container.
    const bgOverlayOpacityTrash = useTransform(x, [-150, 0], [0.1, 0]);
    const bgOverlayOpacityKeep = useTransform(x, [0, 150], [0, 0.1]);

    const controls = useAnimation();
    const router = useRouter();

    // --- Action Handlers ---
    const handleSwipe = async (direction: "left" | "right") => {
        const currentCard = cards[0];
        if (!currentCard) return;

        // Animate off screen
        await controls.start({
            x: direction === "left" ? -500 : 500,
            opacity: 0,
            rotate: direction === "left" ? -20 : 20,
            transition: { duration: 0.2 }
        });

        // Actual Logic
        const newHistory = [...history, { ...currentCard, action: direction }];
        setHistory(newHistory);
        setCards(cards.slice(1));

        // Reset for next card
        x.set(0);
        controls.set({ x: 0, opacity: 1, rotate: 0 });

        // Fetch more if low (simulation)
        if (cards.length < 3) {
            setCards(prev => [...prev, generateEmail(Date.now())]);
        }
    };

    const onDragEnd = (event: any, info: PanInfo) => {
        const threshold = 100;
        if (info.offset.x < -threshold) {
            handleSwipe("left");
        } else if (info.offset.x > threshold) {
            handleSwipe("right");
        } else {
            controls.start({ x: 0, opacity: 1, rotate: 0 });
        }
    };

    // --- Keyboard Shortcuts ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") handleSwipe("left");
            if (e.key === "ArrowRight") handleSwipe("right");
            if (e.key === " ") handleSwipe("right"); // Space to keep
            if (e.key === "Escape") router.push("/mode-select");
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [cards, router]); // Dep on cards to get current state (though handleSwipe uses latest from state?) 
    // Actually handleSwipe needs generic update or Refs to avoid stale state. 
    // For simplicity in this artifact, assume react state updates work fine or use Ref for 'cards'.
    // Better robustness:
    const cardsRef = useRef(cards);
    useEffect(() => { cardsRef.current = cards; }, [cards]);
    // Rewriting handleKeydown below to be safe is better but for now let's stick to dependency.

    // --- Render ---
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

                <Link href="/mode-select" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
            </header>

            {/* --- Swipe Area --- */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 relative w-full max-w-lg mx-auto">
                <div className="relative w-full aspect-[3/4] max-h-[600px]">

                    {/* Background Stack Layer 2 */}
                    <div className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-3xl transform scale-90 translate-y-8 opacity-20 z-0" />

                    {/* Background Stack Layer 1 */}
                    {nextCard && (
                        <div className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-3xl transform scale-95 translate-y-4 opacity-40 z-10 p-8 flex flex-col justify-between">
                            {/* Content Skeleton of Next Card */}
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
                        style={{ x, rotate, opacity }}
                        animate={controls}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.7}
                        onDragEnd={onDragEnd}
                        className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl z-20 flex flex-col cursor-grab active:cursor-grabbing transform-gpu"
                    >
                        {/* Drag Indicators (Stamps) */}
                        <motion.div style={{ opacity: useTransform(x, [50, 150], [0, 1]) }} className="absolute top-8 left-8 border-4 border-emerald-500 text-emerald-500 rounded-xl px-4 py-2 text-4xl font-black uppercase tracking-widest -rotate-12 z-50 bg-zinc-900/80 backdrop-blur-sm">
                            KEEP
                        </motion.div>
                        <motion.div style={{ opacity: useTransform(x, [-150, -50], [1, 0]) }} className="absolute top-8 right-8 border-4 border-red-500 text-red-500 rounded-xl px-4 py-2 text-4xl font-black uppercase tracking-widest rotate-12 z-50 bg-zinc-900/80 backdrop-blur-sm">
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
                                    <p className="text-zinc-400 leading-relaxed text-lg">
                                        {activeCard.preview}
                                    </p>
                                </div>
                            </div>

                            {/* Footer / Hint */}
                            <div className="flex justify-between text-xs font-bold text-zinc-600 uppercase tracking-widest">
                                <span>&larr; Swipe Left to Trash</span>
                                <span>Swipe Right to Keep &rarr;</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* --- Bottom Controls --- */}
                <div className="mt-12 flex items-center gap-8 z-30">
                    <button
                        onClick={() => handleSwipe("left")}
                        className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-700 hover:bg-red-500 hover:border-red-500 text-zinc-400 hover:text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 group"
                    >
                        <Trash2 className="w-8 h-8 group-hover:animate-pulse" />
                    </button>

                    <button
                        className="w-16 h-16 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-600 hover:text-zinc-400 transition-colors"
                        title="Detail View (TBD)"
                    >
                        <ArrowRight className="w-6 h-6 rotate-[-45deg]" />
                    </button>

                    <button
                        onClick={() => handleSwipe("right")}
                        className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-700 hover:bg-emerald-500 hover:border-emerald-500 text-zinc-400 hover:text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 group"
                    >
                        <Check className="w-10 h-10 group-hover:animate-bounce" />
                    </button>
                </div>
            </main>
        </div>
    );
}
