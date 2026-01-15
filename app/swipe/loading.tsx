"use client";

/**
 * Swipe Page Loading Skeleton
 * Shows card-shaped skeleton while emails load
 */

import { motion } from "framer-motion";

export default function SwipeLoading() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
            {/* Top spacer for navbar */}
            <div className="h-20" />

            {/* Header skeleton */}
            <div className="w-full max-w-md mb-8 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="w-16 h-2 bg-zinc-900 rounded-full animate-pulse" />
                    <div className="w-24 h-1.5 bg-zinc-900 rounded-full animate-pulse" />
                </div>
                <div className="w-8 h-8 bg-zinc-900 rounded-lg animate-pulse" />
            </div>

            {/* Card skeleton */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[340px] aspect-[3/4] rounded-[32px] bg-zinc-900 border border-zinc-800 p-6 flex flex-col"
            >
                {/* Sender avatar */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 animate-pulse" />
                    <div className="flex-1">
                        <div className="w-32 h-4 bg-zinc-800 rounded animate-pulse mb-2" />
                        <div className="w-24 h-3 bg-zinc-800/50 rounded animate-pulse" />
                    </div>
                </div>

                {/* Subject line */}
                <div className="w-3/4 h-5 bg-zinc-800 rounded animate-pulse mb-4" />

                {/* Preview lines */}
                <div className="space-y-2 flex-1">
                    <div className="w-full h-3 bg-zinc-800/50 rounded animate-pulse" />
                    <div className="w-5/6 h-3 bg-zinc-800/50 rounded animate-pulse" />
                    <div className="w-4/6 h-3 bg-zinc-800/50 rounded animate-pulse" />
                </div>

                {/* Date */}
                <div className="w-20 h-3 bg-zinc-800/30 rounded animate-pulse mt-auto" />
            </motion.div>

            {/* Hint icons skeleton */}
            <div className="flex items-center gap-8 mt-8">
                <div className="w-10 h-10 bg-zinc-900 rounded-full animate-pulse" />
                <div className="w-10 h-10 bg-zinc-900 rounded-full animate-pulse" />
                <div className="w-10 h-10 bg-zinc-900 rounded-full animate-pulse" />
            </div>
        </div>
    );
}
