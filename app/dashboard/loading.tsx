"use client";

/**
 * Dashboard Loading Skeleton
 * Shows table-like skeleton while sender data loads
 */

import { motion } from "framer-motion";

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-zinc-950 pt-24 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="w-40 h-8 bg-zinc-900 rounded animate-pulse mb-2" />
                        <div className="w-64 h-4 bg-zinc-800/50 rounded animate-pulse" />
                    </div>
                    <div className="flex gap-3">
                        <div className="w-32 h-10 bg-zinc-900 rounded-xl animate-pulse" />
                        <div className="w-10 h-10 bg-zinc-900 rounded-xl animate-pulse" />
                    </div>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl"
                        >
                            <div className="w-16 h-8 bg-zinc-800 rounded animate-pulse mb-2" />
                            <div className="w-24 h-3 bg-zinc-800/50 rounded animate-pulse" />
                        </motion.div>
                    ))}
                </div>

                {/* Search bar skeleton */}
                <div className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse mb-6" />

                {/* Table skeleton */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
                    {/* Table header */}
                    <div className="flex items-center gap-4 p-4 border-b border-zinc-800 bg-zinc-900/50">
                        <div className="w-6 h-6 bg-zinc-800 rounded animate-pulse" />
                        <div className="w-40 h-4 bg-zinc-800 rounded animate-pulse" />
                        <div className="flex-1" />
                        <div className="w-20 h-4 bg-zinc-800 rounded animate-pulse" />
                        <div className="w-20 h-4 bg-zinc-800 rounded animate-pulse" />
                    </div>

                    {/* Table rows */}
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 + i * 0.03 }}
                            className="flex items-center gap-4 p-4 border-b border-zinc-800/50"
                        >
                            <div className="w-6 h-6 bg-zinc-800/50 rounded animate-pulse" />
                            <div className="w-10 h-10 bg-zinc-800/50 rounded-full animate-pulse" />
                            <div className="flex-1">
                                <div className="w-48 h-4 bg-zinc-800/50 rounded animate-pulse mb-1" />
                                <div className="w-32 h-3 bg-zinc-800/30 rounded animate-pulse" />
                            </div>
                            <div className="w-12 h-6 bg-zinc-800/50 rounded animate-pulse" />
                            <div className="w-16 h-8 bg-zinc-800/50 rounded-lg animate-pulse" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
