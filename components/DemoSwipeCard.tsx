"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Trash2, Heart, Mail } from "lucide-react";

interface DemoSwipeCardProps {
    onComplete?: () => void;
}

const DEMO_EMAILS = [
    { id: "1", sender: "newsletter@spam.com", subject: "🔥 50% OFF EVERYTHING!", type: "trash" as const },
    { id: "2", sender: "boss@work.com", subject: "Project deadline update", type: "keep" as const },
    { id: "3", sender: "promo@shopping.com", subject: "Flash Sale Ends Tonight!", type: "trash" as const },
];

export function DemoSwipeCard({ onComplete }: DemoSwipeCardProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [completed, setCompleted] = useState(false);

    const x = useMotionValue(0);
    const rotate = useTransform(x, [-150, 150], [-15, 15]);
    const trashOpacity = useTransform(x, [-100, -50], [1, 0]);
    const keepOpacity = useTransform(x, [50, 100], [0, 1]);

    const currentEmail = DEMO_EMAILS[currentIndex];

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        const threshold = 80;

        if (Math.abs(info.offset.x) > threshold) {
            const direction = info.offset.x > 0 ? "right" : "left";

            // Animate card off screen
            const exitX = direction === "right" ? 300 : -300;

            // Move to next card
            setTimeout(() => {
                if (currentIndex < DEMO_EMAILS.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                    x.set(0);
                } else {
                    setCompleted(true);
                    onComplete?.();
                }
            }, 200);

            x.set(exitX);
        } else {
            // Snap back
            x.set(0);
        }
    };

    if (completed) {
        return (
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
            >
                <div className="w-20 h-20 mx-auto mb-4 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Heart className="w-10 h-10 text-zinc-950 fill-current" />
                </div>
                <p className="text-emerald-400 font-bold text-lg">You've got it!</p>
                <p className="text-zinc-500 text-sm mt-2">Swipe left to trash, right to keep</p>
            </motion.div>
        );
    }

    return (
        <div className="relative w-64 h-40">
            {/* Background hint cards */}
            {currentIndex < DEMO_EMAILS.length - 1 && (
                <div className="absolute inset-0 bg-zinc-800 rounded-2xl transform scale-95 translate-y-2 opacity-30" />
            )}

            {/* Active card */}
            <motion.div
                style={{ x, rotate }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 bg-zinc-900 border border-zinc-700 rounded-2xl p-4 cursor-grab active:cursor-grabbing"
            >
                {/* Trash indicator (left) */}
                <motion.div
                    style={{ opacity: trashOpacity }}
                    className="absolute top-3 right-3 px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded"
                >
                    TRASH
                </motion.div>

                {/* Keep indicator (right) */}
                <motion.div
                    style={{ opacity: keepOpacity }}
                    className="absolute top-3 left-3 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded"
                >
                    KEEP
                </motion.div>

                {/* Email content */}
                <div className="flex items-start gap-3 mt-6">
                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-medium text-zinc-300 truncate">{currentEmail.sender}</div>
                        <div className="text-xs text-zinc-500 mt-1 truncate">{currentEmail.subject}</div>
                    </div>
                </div>

                {/* Progress dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {DEMO_EMAILS.map((_, i) => (
                        <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex ? "bg-emerald-500" :
                                    i < currentIndex ? "bg-emerald-500/50" : "bg-zinc-700"
                                }`}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Drag hints */}
            <div className="absolute -bottom-8 inset-x-0 flex justify-between text-[10px] text-zinc-600 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Trash
                </span>
                <span className="flex items-center gap-1">
                    Keep <Heart className="w-3 h-3" />
                </span>
            </div>
        </div>
    );
}
