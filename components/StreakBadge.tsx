"use client";

import { motion } from "framer-motion";
import { loadStats, getStreakEmoji, getStreakLabel } from "@/lib/userStats";
import { useEffect, useState } from "react";

interface StreakBadgeProps {
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
}

export function StreakBadge({ size = "md", showLabel = true }: StreakBadgeProps) {
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const stats = loadStats();
        setStreak(stats.currentStreak);
    }, []);

    if (streak === 0) return null;

    const sizeClasses = {
        sm: "text-sm gap-1",
        md: "text-base gap-1.5",
        lg: "text-xl gap-2",
    };

    const flameScale = {
        sm: 1,
        md: streak >= 7 ? 1.3 : streak >= 3 ? 1.15 : 1,
        lg: streak >= 7 ? 1.5 : streak >= 3 ? 1.25 : 1,
    };

    return (
        <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`flex items-center ${sizeClasses[size]}`}
        >
            <motion.span
                animate={streak >= 7 ? {
                    scale: [1, 1.1, 1],
                } : {}}
                transition={streak >= 7 ? {
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                } : {}}
                style={{ transform: `scale(${flameScale[size]})` }}
                className="inline-block"
            >
                {getStreakEmoji(streak)}
            </motion.span>
            {showLabel && (
                <span className={`font-bold ${streak >= 7 ? "text-orange-400" : streak >= 3 ? "text-amber-400" : "text-zinc-400"}`}>
                    {streak >= 7 ? "ON FIRE" : `${streak}d`}
                </span>
            )}
        </motion.div>
    );
}
