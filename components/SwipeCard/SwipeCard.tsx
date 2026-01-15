/**
 * SwipeCard Component - Mobile-First Tinder-Style
 * Single source of truth for swipe cards
 */

"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo, useAnimation } from "framer-motion";
import { Trash2, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { NormalizedEmail } from "@/lib/types";

// Helper: Generate avatar color from string
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

// Helper: Get initials
function getInitials(name: string): string {
    return name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?";
}

// Helper: Time ago
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

export interface SwipeCardProps {
    email: NormalizedEmail;
    onSwipe: (direction: "left" | "right") => void;
    isActive?: boolean;
}

export function SwipeCard({
    email,
    onSwipe,
    isActive = true,
}: SwipeCardProps) {
    const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);

    // Motion values for drag
    const x = useMotionValue(0);
    const controls = useAnimation();

    // TINDER-LIKE THRESHOLDS - Low for snappy feel
    const threshold = 40;  // ~40px drag to trigger
    const velocityThreshold = 300;  // px/s - quick flick triggers

    // Transform rotation based on horizontal drag
    const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);

    // Action stamp opacity
    const trashOpacity = useTransform(x, [-threshold * 2, -threshold / 2, 0], [1, 0.5, 0]);
    const keepOpacity = useTransform(x, [0, threshold / 2, threshold * 2], [0, 0.5, 1]);

    // Background color bleed
    const bgColor = useTransform(
        x,
        (latestX: number) => {
            const absX = Math.abs(latestX);
            if (absX < 10) return "transparent";
            const intensity = Math.min(absX / 150, 0.3);
            return latestX < 0
                ? `rgba(239, 68, 68, ${intensity})` // red = trash
                : `rgba(16, 185, 129, ${intensity})`; // emerald = keep
        }
    );

    const handleDragEnd = async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const { offset, velocity } = info;

        // Determine swipe direction
        const swipeLeft = offset.x < -threshold || velocity.x < -velocityThreshold;
        const swipeRight = offset.x > threshold || velocity.x > velocityThreshold;

        if (swipeLeft) {
            setExitDirection("left");
            // Haptic feedback
            if (typeof window !== "undefined" && window.navigator.vibrate) {
                window.navigator.vibrate(20);
            }
            // Animate out
            await controls.start({
                x: -500,
                opacity: 0,
                rotate: -30,
                transition: { type: "spring", stiffness: 500, damping: 30 }
            });
            onSwipe("left");
        } else if (swipeRight) {
            setExitDirection("right");
            if (typeof window !== "undefined" && window.navigator.vibrate) {
                window.navigator.vibrate(20);
            }
            await controls.start({
                x: 500,
                opacity: 0,
                rotate: 30,
                transition: { type: "spring", stiffness: 500, damping: 30 }
            });
            onSwipe("right");
        } else {
            // Snap back
            controls.start({
                x: 0,
                rotate: 0,
                transition: { type: "spring", stiffness: 500, damping: 25 }
            });
        }
    };

    const senderName = email.senderName || email.sender.split("@")[0];
    const initials = getInitials(senderName);
    const avatarColor = stringToColor(email.sender);
    const timeAgo = getTimeAgo(email.timestamp);
    const category = email.category;

    return (
        <motion.div
            drag={isActive ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            onDragEnd={handleDragEnd}
            animate={controls}
            style={{ x, rotate }}
            whileDrag={{ scale: 1.02, cursor: "grabbing" }}
            className="w-full h-full bg-zinc-950 border border-emerald-500/20 rounded-3xl shadow-2xl flex flex-col cursor-grab touch-manipulation overflow-hidden"
        >
            {/* Background color overlay */}
            <motion.div
                style={{ backgroundColor: bgColor }}
                className="absolute inset-0 rounded-3xl pointer-events-none z-0"
            />

            {/* TRASH Stamp (Left) */}
            <motion.div
                style={{ opacity: trashOpacity }}
                className="absolute top-6 right-6 border-2 border-red-500 text-red-500 rounded-lg px-3 py-1.5 text-lg sm:text-xl font-black uppercase tracking-widest rotate-12 z-50 bg-black/80 shadow-lg"
            >
                TRASH
            </motion.div>

            {/* KEEP Stamp (Right) */}
            <motion.div
                style={{ opacity: keepOpacity }}
                className="absolute top-6 left-6 border-2 border-emerald-500 text-emerald-500 rounded-lg px-3 py-1.5 text-lg sm:text-xl font-black uppercase tracking-widest -rotate-12 z-50 bg-black/80 shadow-lg"
            >
                KEEP
            </motion.div>

            {/* Card Content */}
            <div className="relative z-10 flex-1 flex flex-col p-5 sm:p-6 md:p-8">
                {/* Header */}
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${avatarColor} flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg shrink-0 border border-white/10`}>
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl font-black tracking-tight text-white truncate leading-tight">
                            {senderName}
                        </h2>
                        <div className="flex items-center gap-2 sm:gap-3 mt-1">
                            <span className="text-[10px] sm:text-xs text-zinc-500 font-mono font-bold tracking-wider uppercase">
                                {timeAgo}
                            </span>
                            <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${category === "promo" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                    category === "social" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                        category === "newsletter" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                            "bg-zinc-800 text-zinc-400 border-zinc-700"
                                }`}>
                                {category}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Subject */}
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white mb-3 sm:mb-4 line-clamp-2 leading-tight">
                    {email.subject || "(No Subject)"}
                </h3>

                {/* Preview */}
                <div className="flex-1 relative">
                    <p className="text-sm sm:text-base text-zinc-400 leading-relaxed line-clamp-4 sm:line-clamp-5 md:line-clamp-6">
                        {email.preview}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
                </div>

                {/* Swipe Hints */}
                <div className="mt-auto pt-4 sm:pt-6 border-t border-zinc-800/50 flex justify-between items-center text-[10px] sm:text-xs font-bold tracking-widest text-zinc-600 uppercase">
                    <div className="flex items-center gap-1.5">
                        <ArrowLeft size={14} />
                        <span>Trash</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span>Keep</span>
                        <ArrowRight size={14} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
